﻿using System;
using System.IO;
using Puerts;
using UnityEngine;
using System.Linq;
#if UNITY_EDITOR
using UnityEditor;
#endif

namespace XOR
{
    public class Application : SingletonMonoBehaviour<Application>
    {
        public JsEnv Env { get; private set; } = null;
        public MergeLoader Loader { get; private set; }
        public ushort debugPort = 9090;

        #region  Editor Debugger
#if UNITY_EDITOR
        private static bool IsWaitDebugger
        {
            get { return EditorPrefs.GetBool("Editor.DebugEnable"); }
            set { EditorPrefs.SetBool("Editor.DebugEnable", value); }
        }
        [MenuItem("PuerTS/Enable WaitDebugger")]
        private static void Enable() { IsWaitDebugger = true; }
        [MenuItem("PuerTS/Enable WaitDebugger", true)]
        private static bool EnableValidate() { return !IsWaitDebugger; }
        [MenuItem("PuerTS/Disable WaitDebugger")]
        private static void Disable() { IsWaitDebugger = false; }
        [MenuItem("PuerTS/Disable WaitDebugger", true)]
        private static bool DisableValidate() { return IsWaitDebugger; }
#endif
        #endregion

        void Awake()
        {
            if (__instance != null && __instance != this)
            {
                DestroyImmediate(this);
                Debug.LogWarning($"Multiple instantiation of {nameof(Application)}");
                return;
            }
            __instance = this;

            bool isESM = Settings.Load().isESM;

            Loader = new MergeLoader();
            Loader.AddLoader(new DefaultLoader(), int.MaxValue);

            Env = new JsEnv(Loader, debugPort);
            Env.TryAutoUsing();
            Env.RequireXORModules();
            if (!isESM) Env.SupportCommonJS();
#if UNITY_EDITOR
            if (IsWaitDebugger && debugPort > 0)
            {
                Env.WaitDebugger();
            }
#endif
        }
        void Update()
        {
            Env?.Tick();
        }
        void OnDestroy()
        {
            Dispose();
        }
        public override void Release()
        {
            base.Release();
            Dispose();
        }
        void Dispose()
        {
            if (Env != null)
            {
                Env.GlobalListenerQuit();
                Env.Tick();
                //GC
                System.GC.Collect();
                System.GC.WaitForPendingFinalizers();
                //Dispose
                Env.Dispose();
                Env = null;
            }
            if (Loader != null)
            {
                Loader.Dispose();
                Loader = null;
            }
            //GC
            System.GC.Collect();
            System.GC.WaitForPendingFinalizers();
        }
    }
}