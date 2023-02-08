﻿using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Sample_04 : MonoBehaviour
{
    void Start()
    {
        var app = XOR.Application.Instance;
        if (app == null || app.IsDestroyed)
        {
            Debug.LogWarning($"{nameof(XOR.Application)} not running");
            return;
        }
        var func = app.Env.Eval<Action<Puerts.ILoader>>("var m = require('./samples/04_ThreadWorker/main'); m.init;");
        func(app.Loader);
    }
}
