using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Puerts;

namespace XOR
{
    public class MergeLoader : ILoader, IDisposable, IModuleChecker
    {
        private static readonly Regex ESMImport = new Regex(@"(^import [\S ]+|\r?\nimport [\S ]+)");
        private static readonly Regex ESMExport = new Regex(@"(^export [\S ]+|\r?\nexport [\S ]+)");
        private readonly List<PLoader> loaders;
        /// <summary>
        /// 如果filepath不是合法的js文件名, 则为其追加此后缀名(默认:.js, 如为空表示不作处理)
        /// </summary>
        public string AppendExtensionName { get; set; } = ".js";

        public MergeLoader() : this(null) { }
        public MergeLoader(MergeLoader other)
        {
            this.loaders = new List<PLoader>();
            if (other != null)
            {
                this.loaders.AddRange(other.loaders);
            }
        }

        public void Dispose()
        {
            foreach (var ploader in loaders)
            {
                ploader.Dispose();
            }
            loaders.Clear();
        }

        public bool FileExists(string filepath)
        {
            ExtensionValidate(ref filepath);
            foreach (var ploader in loaders)
            {
                if (ploader.loader.FileExists(filepath))
                    return true;
            }
            return false;
        }
        public string ReadFile(string filepath, out string debugpath)
        {
            ExtensionValidate(ref filepath);
            foreach (var ploader in loaders)
            {
                string script = ploader.loader.ReadFile(filepath, out debugpath);
                if (!string.IsNullOrEmpty(script))
                    return script; ;
            }
            debugpath = filepath;
            return null;
        }
        public bool IsESM(string filepath)
        {
            ExtensionValidate(ref filepath);
            foreach (var ploader in loaders)
            {
                if (!ploader.loader.FileExists(filepath))
                    continue;
                if (ploader.loader is IModuleChecker && ((IModuleChecker)ploader.loader).IsESM(filepath))
                {
                    return true;
                }
                string script = ploader.loader.ReadFile(filepath, out string debugpath);
                //UnityEngine.Debug.Log("ExecuteModule: " + filepath + ", IsESM: " + (script != null && (ESMImport.IsMatch(script) || ESMExport.IsMatch(script))));
                return script != null && (ESMImport.IsMatch(script) || ESMExport.IsMatch(script));
            }
            return false;
        }
        public void AddLoader(ILoader loader, int index = 0)
        {
            if (typeof(MergeLoader).IsAssignableFrom(loader.GetType()))
            {
                throw new ArgumentException("Nested instance is not allowed");
            }
            loaders.Add(new PLoader(loader, index));
            loaders.Sort((v1, v2) => v1.index > v2.index ? 1 : v1.index < v2.index ? -1 : 0);
        }

        public bool RemoveLoader<T>() where T : ILoader
        {
            return RemoveLoader(typeof(T));
        }
        public bool RemoveLoader(Type type)
        {
            var loaders = GetLoaders(type);
            for (int i = 0; i < loaders.Length; i++)
            {
                RemoveLoader(loaders[i]);
            }
            return loaders.Length > 0;
        }
        public bool RemoveLoader(ILoader loader)
        {
            for (int i = loaders.Count - 1; i >= 0; i--)
            {
                if (loaders[i].loader == loader)
                {
                    loaders.RemoveAt(i);
                    return true;
                }
            }
            return false;
        }

        public T[] GetLoaders<T>() where T : ILoader
        {
            return GetLoaders(typeof(T)) as T[];
        }
        public ILoader[] GetLoaders(Type type)
        {
            var results = new List<ILoader>();
            foreach (var package in this.loaders)
            {
                if (type.IsAssignableFrom(package.loader.GetType()))
                {
                    results.Add(package.loader);
                }
            }
            return results.ToArray();
        }
        internal class PLoader
        {
            public readonly ILoader loader;
            public readonly int index;
            public PLoader(ILoader loader, int index)
            {
                this.loader = loader;
                this.index = index;
            }
            public void Dispose()
            {
                if (typeof(IDisposable).IsAssignableFrom(loader.GetType()))
                    ((IDisposable)loader).Dispose();
            }
        }

        void ExtensionValidate(ref string filepath)
        {
            if (string.IsNullOrEmpty(AppendExtensionName))
                return;
            if (!filepath.EndsWith(".js") && !filepath.EndsWith(".cjs") && !filepath.EndsWith(".mjs") && !filepath.EndsWith(".json"))
            {
                filepath += AppendExtensionName;
            }
        }
    }

    public class FileLoader : ILoader
    {
        private readonly string outputRoot;
        private readonly string projectRoot;
        public FileLoader(string outputRoot, string projectRoot = null)
        {
            this.outputRoot = outputRoot;
            this.projectRoot = string.IsNullOrEmpty(projectRoot) ? outputRoot : projectRoot;
        }
        public bool FileExists(string filepath)
        {
            return File.Exists(GetFilePath(filepath));
        }

        public string ReadFile(string filepath, out string debugpath)
        {
            var path = GetFilePath(filepath);
            if (File.Exists(path))
            {
                debugpath = path;
                return File.ReadAllText(path);
            }
            debugpath = filepath;
            return null;
        }
        string GetFilePath(string filepath)
        {
#if UNITY_EDITOR
            var path = filepath;
            if (!path.EndsWith(".js") && !path.EndsWith(".cjs") && !path.EndsWith(".mjs") && !path.EndsWith(".json"))
            {
                //Logger.LogWarning("unknown file extension: " + filepath);
            }

            if (path.StartsWith("node_modules/"))
                path = Path.Combine(projectRoot, path);
            else
                path = Path.Combine(outputRoot, path);
            if (File.Exists(path))
            {
#if UNITY_STANDALONE_WIN
                path = path.Replace("/", "\\");
#else
            path = path.Replace("\\", "/");
#endif
                return path;
            }
#endif
            return filepath;
        }
    }

    public class CacheLoader : ILoader, IDisposable
    {
        public string rootPath { get; set; }
        public bool ignoreCase { get; set; } = true;
        //缓存池
        private readonly Dictionary<string, string> scripts = new Dictionary<string, string>();

        public void Dispose()
        {
            this.scripts.Clear();
        }

        public bool FileExists(string filepath)
        {
            if (string.IsNullOrEmpty(filepath))
                return false;

            filepath = CombinePath(filepath);
            if (ignoreCase)
            {
                filepath = filepath.ToLower();
            }

            string script = null;
            scripts.TryGetValue(filepath, out script);
            return !string.IsNullOrEmpty(script);
        }
        public string ReadFile(string filepath, out string debugpath)
        {
            if (string.IsNullOrEmpty(filepath))
            {
                debugpath = null;
                return null;
            }

            filepath = debugpath = CombinePath(filepath);
            if (ignoreCase)
            {
                filepath = filepath.ToLower();
            }

            string script = null;
            scripts.TryGetValue(filepath, out script);
            if (!string.IsNullOrEmpty(script))
                return script;

            return null;
        }

        public void AddScript(string filepath, string script)
        {
            filepath = CombinePath(filepath);
            if (ignoreCase)
            {
                filepath = filepath?.ToLower();
            }

            if (scripts.ContainsKey(filepath))
            {
                scripts.Remove(filepath);
            }
            scripts.Add(filepath, script);
        }
        public void AddScripts(Dictionary<string, string> scripts)
        {
            string filepath = null;
            foreach (var _script in scripts)
            {
                filepath = CombinePath(_script.Key);
                if (ignoreCase)
                {
                    filepath = filepath?.ToLower();
                }
                if (scripts.ContainsKey(filepath))
                {
                    scripts.Remove(filepath);
                }
                this.scripts.Add(filepath, _script.Value);
            }
        }
        public bool RemoveScript(string filepath)
        {
            filepath = CombinePath(filepath);
            if (ignoreCase)
            {
                filepath = filepath?.ToLower();
            }

            return scripts.Remove(filepath);
        }
        string CombinePath(string filepath)
        {
            if (!string.IsNullOrEmpty(rootPath))
            {
                return Path.Combine(rootPath, filepath);
            }
            return filepath;
        }
    }
}

