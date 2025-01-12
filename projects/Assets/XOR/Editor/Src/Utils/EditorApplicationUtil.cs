using System;
using System.Collections.Generic;
using System.IO;
using XOR.Services;

namespace XOR
{
    internal static class EditorApplicationUtil
    {
        public static bool IsRunning() => EditorApplication.Instance != null;
        public static bool IsInitializing() => IsRunning() && EditorApplication.Instance.IsInitializing();
        public static bool IsWorkerRunning() => IsRunning() && EditorApplication.Instance.IsWorkerRunning();
        public static bool IsAvailable()
        {
            return IsRunning() && EditorApplication.Instance.IsWorkerRunning() && !EditorApplication.Instance.IsInitializing();
        }
        public static string GetStatus()
        {
            if (!IsRunning())
                return "UNKNOWN";
            Program program = EditorApplication.Instance?.Program;
            if (program == null)
                return "Initializing";
            return Enum.GetName(typeof(ProgramState), program.state);
        }
        public static string GetCompileStatus()
        {
            if (!IsRunning())
                return "UNKNOWN";
            Program program = EditorApplication.Instance?.Program;
            if (program == null || string.IsNullOrEmpty(program.compile))
                return "-";
            return program.compile;
        }
        public static string GetScripts()
        {
            EditorApplication app = EditorApplication.Instance;
            if (app == null || app.Program == null)
                return "UNKNOWN";
            return $"{app.Program.scripts}";
        }
        public static string GetErrors()
        {
            EditorApplication app = EditorApplication.Instance;
            if (app == null || app.Program == null)
                return "UNKNOWN";
            return $"{app.Program.errors}";
        }
        public static int GetErrorsCount()
        {
            EditorApplication app = EditorApplication.Instance;
            if (app == null || app.Program == null)
                return 0;
            return app.Program.errors;
        }
        public static string GetTypeCount()
        {
            EditorApplication app = EditorApplication.Instance;
            if (app == null || app.Program == null)
                return "UNKNOWN";
            return $"{app.Program.Statements.Count}";
        }
        public static Program GetProgram()
        {
            EditorApplication app = EditorApplication.Instance;
            if (app == null || app.Program == null)
                return null;
            return app.Program;
        }
        public static Statement GetStatement(string guid)
        {
            EditorApplication app = EditorApplication.Instance;
            if (app == null || app.Program == null)
                return null;
            Statement statement = null;
            if (guid != null)
            {
                app.Program.Statements.TryGetValue(guid, out statement);
            }
            return statement;
        }

        public static void Start()
        {
            Prefs.ASTEnable.SetValue(true);
            try
            {
                string editorProjectConfig = Settings.Load().editorProject,
                    projectConfig = Settings.Load().project;
                bool useNodejsWatch = Settings.Load().watchType == Settings.WacthType.Nodejs && PuertsUtil.IsSupportNodejs();

                editorProjectConfig = PathUtil.GetFullPath(editorProjectConfig);
                projectConfig = PathUtil.GetFullPath(projectConfig);
                if (!File.Exists(editorProjectConfig))
                {
                    string newPath = GUIUtil.RenderSelectEditorProject(editorProjectConfig);
                    if (string.IsNullOrEmpty(newPath))
                    {
                        Prefs.ASTEnable.SetValue(false);
                        return;
                    }
                    editorProjectConfig = PathUtil.GetFullPath(newPath);
                }
                if (!File.Exists(projectConfig))
                {
                    string newPath = GUIUtil.RenderSelectProject(projectConfig);
                    if (string.IsNullOrEmpty(newPath))
                    {
                        Prefs.ASTEnable.SetValue(false);
                        return;
                    }
                    projectConfig = PathUtil.GetFullPath(newPath);
                }
                if (!Check(editorProjectConfig)) return;
                if (!Check(projectConfig)) return;

                string editorRoot = Path.GetDirectoryName(editorProjectConfig);
                string editorOutput = Path.Combine(editorRoot, "output");

                Logger.Log($"<b>XOR.{nameof(EditorApplication)}: <color=green>Executing</color></b> \neditorRoot: {editorRoot}\neditorOutput: {editorOutput}");

                //创建EditorApplication实例
                EditorApplication app = EditorApplication.GetInstance();
                app.Loader.AddLoader(new FileLoader(editorOutput, editorRoot));
                app.Env.UsingAction<string, string, bool>();
                //create interfaces
                CSharpInterfaces ci = new CSharpInterfaces();
                ci.SetWorker = app.SetWorker;
                ci.SetProgram = app.SetProgram;
                //init application
                Func<CSharpInterfaces, TSInterfaces> Init = app.Env.Eval<Func<CSharpInterfaces, TSInterfaces>>(@"var m = require('./main/main'); m.init; ");
                TSInterfaces ti = Init(ci);
                app.SetInterfaces(ti);

                ti.Start(editorOutput, projectConfig, useNodejsWatch);

                //监听文件修改
                EditorFileWatcher.ReleaseInstance();
                if (!useNodejsWatch && Settings.Load().watchType != Settings.WacthType.None)
                {
                    string dirpath = Path.GetDirectoryName(projectConfig);
                    EditorFileWatcher watcher = EditorFileWatcher.GetInstance();
                    watcher.AddWatcher(dirpath, "*.ts");
                    watcher.AddWatcher(dirpath, "*.tsx");
                    watcher.OnChanged((path, type) => ti.FileChanged(path));
                    watcher.Start(true);
                    Logger.Log($"<b>XOR.{nameof(EditorFileWatcher)}:</b> {dirpath}");
                }

                Logger.Log($"<b>XOR.{nameof(EditorApplication)}: <color=green>Started</color>.</b>");
            }
            catch (System.Exception e)
            {
                Prefs.ASTEnable.SetValue(false);
                EditorApplication.ReleaseInstance();
                EditorFileWatcher.ReleaseInstance();
                Logger.Log($"<b>XOR.{nameof(EditorApplication)}: <color=red>Exception</color>:</b>\n{e}");
            }
        }
        public static void Stop(bool print = true)
        {
            Prefs.ASTEnable.SetValue(false);
            EditorApplication.ReleaseInstance();
            EditorFileWatcher.ReleaseInstance();
            if (!UnityEngine.Application.isPlaying)
            {
                ThreadWorker.ReleaseAllInstances();
            }

            if (print) Logger.Log($"<b>XOR.{nameof(EditorApplication)}: <color=red>Stoped</color>.</b>");
        }


        static bool Check(string tsconfigPath)
        {
            //check dependents install
            string packagePath = Path.Combine(Path.GetDirectoryName(tsconfigPath), "package.json");
            if (!File.Exists(packagePath))
            {
                GUIUtil.RenderInvailTsconfig(tsconfigPath);
                return false;
            }
            string[] uninstallModules = NPMUtil.CheckDependentsInstall(packagePath);
            if (uninstallModules != null && uninstallModules.Length > 0)
            {
                bool open = GUIUtil.RenderDependentsUninstall(tsconfigPath, uninstallModules);
                if (open) UnityEditor.EditorUtility.RevealInFinder(tsconfigPath);
                return false;
            }
            //check compile output
            return true;
        }
    }
}