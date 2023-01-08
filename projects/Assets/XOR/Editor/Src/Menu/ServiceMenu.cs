﻿using System;
using UnityEditor;

namespace XOR
{
    public class ServiceMenu
    {
        static ServiceMenu()
        {
            XOR.EditorApplication.Update += Update;

            if (Prefs.Enable && !Util.IsRunning())
            {
                //Enable();
            }
        }

        static void Update()
        {
            TsServiceProcess.Instance?.Tick();
        }


        [MenuItem("Tools/XOR/Reload")]
        static void Reload()
        {
            TsServiceProcess.ReleaseInstance();
            Util.Enable();
        }
        [MenuItem("Tools/XOR/Enable")] 
        static void Enable() => Util.Enable();
        [MenuItem("Tools/XOR/Enable", true)]
        static bool EnableValidate() => !Util.IsRunning();
        [MenuItem("Tools/XOR/Disable")]
        static void Disable() => Util.Disable();
        [MenuItem("Tools/XOR/Disable", true)]
        static bool DisableValidate() => Util.IsRunning();
    }
}
