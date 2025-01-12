var Transform = CS.UnityEngine.Transform;
var RectTransform = CS.UnityEngine.RectTransform;
var Application = CS.UnityEngine.Application;
var Time = CS.UnityEngine.Time;
var CSObject = CS.System.Object;
const { File, Path } = CS.System.IO;
const isEditor = Application.isEditor;
/**
 * 详情参阅: https://docs.unity3d.com/cn/current/ScriptReference/MonoBehaviour.html
 */
class IBehaviour {
}
class IGizmos {
}
class IOnPointerHandler {
}
class IOnDragHandler {
}
class IOnCollision {
}
class IOnCollision2D {
}
class IOnTrigger {
}
class IOnTrigger2D {
}
class IOnMouse {
}
/**
 * 沿用C# MonoBehaviour习惯, 将OnEnable丶Update丶OnEnable等方法绑定到C#对象上, Unity将在生命周期内调用
 *
 * 注: 为避免多次跨语言调用, Update丶FixedUpdate丶LateUpdate方法将由BatchProxy统一管理(并非绑定到各自的GameObject上)
 * @see standalone 如果需要绑定独立的组件, 在对应方法上添加此标注
 */
class TsBehaviourConstructor {
    constructor() {
        let object = arguments[0], accessor, args, before, after;
        let p2 = arguments[1];
        switch (typeof (p2)) {
            case "object":
                if (p2 === null) { }
                else if (p2 instanceof CSObject || Array.isArray(p2)) {
                    accessor = p2;
                }
                else {
                    accessor = p2.accessor;
                    args = p2.args;
                    before = p2.before;
                    after = p2.after;
                }
                break;
            case "boolean":
                accessor = p2;
                break;
        }
        let gameObject;
        if (object instanceof CS.XOR.TsBehaviour) {
            gameObject = object.gameObject;
            this.__component__ = object;
        }
        else if (object instanceof Transform) {
            gameObject = object.gameObject;
        }
        else {
            gameObject = object;
        }
        this.__gameObject__ = gameObject;
        this.__transform__ = gameObject.transform;
        //bind props
        if (accessor === undefined || accessor === true) {
            TsBehaviourConstructor.bindAccessor(this, object.GetComponents(puerts.$typeof(CS.XOR.TsProperties)), true);
        }
        else if (accessor) {
            TsBehaviourConstructor.bindAccessor(this, accessor, true);
        }
        //call constructor
        let onctor = this["onConstructor"];
        if (onctor && typeof (onctor) === "function") {
            call(this, onctor, args);
        }
        //call before callback
        if (before)
            call(this, before);
        this._bindProxies();
        this._bindUpdateProxies();
        this._bindListeners();
        this._bindModuleOfEditor();
        //call after callback
        if (after)
            call(this, after);
    }
    //协程
    StartCoroutine(routine, ...args) {
        //传入了js Generator方法, 转为C#迭代器对象
        var iterator = cs_generator(routine, ...args);
        return this.component.StartCoroutine(iterator);
    }
    StopCoroutine(routine) {
        this.component.StopCoroutine(routine);
    }
    StopAllCoroutines() {
        this.component.StopAllCoroutines();
    }
    /**添加Unity Message listener
     * @param eventName
     * @param fn
     */
    addListener(eventName, fn) {
        //create message proxy
        if (!this.__listenerProxy__ || this.__listenerProxy__.Equals(null)) {
            this.__listenerProxy__ = (this.__gameObject__.GetComponent(puerts.$typeof(CS.XOR.TsMessages)) ??
                this.__gameObject__.AddComponent(puerts.$typeof(CS.XOR.TsMessages)));
            this.__listenerProxy__.emptyCallback = () => this._invokeListeners('');
            this.__listenerProxy__.callback = (name, args) => this._invokeListeners(name, args);
        }
        //add listeners
        if (!this.__listeners__) {
            this.__listeners__ = new Map();
        }
        if (eventName === undefined || eventName === null || eventName === void 0)
            eventName = '';
        let functions = this.__listeners__.get(eventName);
        if (!functions) {
            functions = [];
            this.__listeners__.set(eventName, functions);
        }
        functions.push(fn);
    }
    /**移除Unity Message listener
     * @param eventName
     * @param fn
     */
    removeListener(eventName, fn) {
        if (!this.__listeners__)
            return;
        if (eventName === undefined || eventName === null || eventName === void 0)
            eventName = '';
        let functions = this.__listeners__.get(eventName);
        if (!functions)
            return;
        functions = functions.filter(f => f !== fn);
        if (functions.length > 0) {
            this.__listeners__.set(eventName, functions);
        }
        else {
            this.__listeners__.delete(eventName);
            if (this.__listeners__.size === 0)
                this.clearListeners();
        }
    }
    /**移除所有Unity Message listener
     * @param eventName
     */
    removeAllListeners(eventName) {
        if (!this.__listeners__)
            return;
        if (eventName === undefined || eventName === null || eventName === void 0)
            eventName = '';
        this.__listeners__.delete(eventName);
        if (this.__listeners__.size === 0)
            this.clearListeners();
    }
    /**清空Unity Message listener */
    clearListeners() {
        if (!this.__listeners__)
            return;
        this.__listeners__ = null;
        this.__listenerProxy__.callback = null;
        this.__listenerProxy__.emptyCallback = null;
    }
    _invokeListeners(eventName, args) {
        if (!this.__listeners__) {
            console.warn(`invail invoke: ${eventName}`);
            return;
        }
        let functions = this.__listeners__.get(eventName);
        if (!functions)
            return;
        if (args instanceof CS.System.Array) {
            let _args = new Array();
            for (let i = 0; i < args.Length; i++) {
                _args.push(args.get_Item(i));
            }
            args = _args;
        }
        functions.forEach(fn => fn.apply(undefined, args));
    }
    //protected
    disponse() {
        this.__gameObject__ = undefined;
        this.__transform__ = undefined;
        this.__component__ = undefined;
    }
    //绑定Proxy方法
    _bindProxies() {
        ["Awake", "Start", "OnDestroy"].forEach(name => {
            let func = bind(this, name);
            if (func) {
                try {
                    this.component.CreateProxy(name, func);
                }
                catch (e) {
                    console.error(e.message + "\n" + e.stack);
                }
            }
        });
        ["OnApplicationQuit", "OnDisable", "OnEnable", "OnGUI"].forEach(name => {
            let func = bind(this, name);
            if (func) {
                this.component.CreateProxy(name, func);
            }
        });
        if (isEditor) {
            ["OnDrawGizmosSelected", "OnSceneGUI"].forEach(name => {
                let func = bind(this, name);
                if (func) {
                    this.component.CreateProxy(name, func);
                }
            });
        }
        ["OnMouseDown", "OnMouseDrag", "OnMouseEnter", "OnMouseExit", "OnMouseOver", "OnMouseUp", "OnMouseUpAsButton"].forEach(name => {
            let func = bind(this, name);
            if (func) {
                this.component.CreateProxy(name, func);
            }
        });
        //Action<bool>
        ["OnApplicationFocus", "OnApplicationPause", "OnBecameVisible"].forEach(name => {
            let func = bind(this, name);
            if (func) {
                this.component.CreateProxyForBool(name, func);
            }
        });
        //Action<PointerEventData>
        ["OnPointerClick", "OnPointerDown", "OnPointerEnter", "OnPointerExit", "OnPointerUp"].forEach(name => {
            let func = bind(this, name);
            if (func) {
                this.component.CreateProxyForEventData(name, func);
            }
        });
        //触发器方法 Collision Trigger
        const proxyCfg = [
            ["CreateProxyForDrag", "OnBeginDrag", "OnDrag", "OnEndDrag"],
            ["CreateProxyForCollision", "OnCollisionEnter", "OnCollisionStay", "OnCollisionExit"],
            ["CreateProxyForCollision2D", "OnCollisionEnter2D", "OnCollisionStay2D", "OnCollisionExit2D"],
            ["CreateProxyForTrigger", "OnTriggerEnter", "OnTriggerStay", "OnTriggerExit"],
            ["CreateProxyForTrigger2D", "OnTriggerEnter2D", "OnTriggerStay2D", "OnTriggerExit2D"],
        ];
        proxyCfg.forEach(cfg => {
            let [funcname, funcEnter, funcStay, funcExit] = cfg;
            let enter = bind(this, funcEnter), stay = bind(this, funcStay), exit = bind(this, funcExit);
            if (enter || stay || exit)
                this.component[funcname](enter, stay, exit);
        });
    }
    _bindUpdateProxies() {
        let proto = Object.getPrototypeOf(this);
        //Update方法
        const proxies = [
            ["Update", BatchProxy.Update],
            ["LateUpdate", BatchProxy.LateUpdate],
            ["FixedUpdate", BatchProxy.FixedUpdate],
        ].map(([funcname, proxy]) => {
            let waitAsyncComplete = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.throttle, false);
            let func = bind(this, funcname, waitAsyncComplete);
            if (!func) {
                return null;
            }
            if (Metadata.isDefine(proto, funcname, TsBehaviourConstructor.standalone)) {
                this.component.CreateProxy(funcname, func);
                return undefined;
            }
            let frameskip = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.frameskip, 0);
            return [func, proxy, frameskip];
        }).filter(o => !!o);
        if (proxies.length > 0) {
            let enabled = false;
            let enable = function () {
                if (enabled)
                    return;
                enabled = true;
                proxies.forEach(([func, batch, frameskip]) => batch.addListener(func, frameskip));
            };
            let disable = function () {
                if (!enabled)
                    return;
                enabled = false;
                proxies.forEach(([func, batch, frameskip]) => batch.removeListener(func, frameskip));
            };
            //生命周期管理
            let proxy = this.component.GetProxy("OnEnable");
            if (!proxy || proxy.Equals(null))
                this.component.CreateProxy("OnEnable", enable);
            else {
                proxy.callback = CS.System.Delegate.Combine(proxy.callback, new CS.System.Action(enable));
            }
            proxy = this.component.GetProxy("OnDisable");
            if (!proxy || proxy.Equals(null))
                this.component.CreateProxy("OnDisable", disable);
            else {
                proxy.callback = CS.System.Delegate.Combine(proxy.callback, new CS.System.Action(disable));
            }
            proxy = this.component.GetProxy("OnDestroy");
            if (!proxy || proxy.Equals(null))
                this.component.CreateProxy("OnDestroy", disable);
            else {
                proxy.callback = CS.System.Delegate.Combine(proxy.callback, new CS.System.Action(disable));
            }
        }
        ;
    }
    _bindListeners() {
        let proto = Object.getPrototypeOf(this);
        for (let funcname of Metadata.getKeys(proto)) {
            let eventName = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.listener);
            if (!eventName)
                continue;
            let waitAsyncComplete = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.throttle, false);
            let func = bind(this, funcname, waitAsyncComplete);
            if (!func)
                return undefined;
            this.addListener(eventName, func);
        }
    }
    //绑定脚本内容
    _bindModuleOfEditor() {
        if (!isEditor || !this.__gameObject__ || this.__gameObject__.Equals(null))
            return;
        //堆栈信息
        let stack = new Error().stack
            .replace(/\r\n/g, "\n")
            .split('\n')
            .slice(2)
            .join("\n");
        //class名称
        let className = Object.getPrototypeOf(this).constructor.name;
        let moduleName, modulePath, moduleLine, moduleColumn;
        //匹配new构造函数
        //let regex = /at [a-zA-z0-9#$._ ]+ \(([a-zA-Z0-9:/\\._ ]+(.js|.ts))\:([0-9]+)\:([0-9]+)\)/g;
        let regex = /at [a-zA-z0-9#$._ ]+ \(([^\n\r\*\"\|\<\>]+(.js|.cjs|.mjs|.ts|.mts))\:([0-9]+)\:([0-9]+)\)/g;
        let match;
        while (match = regex.exec(stack)) {
            let isConstructor = match[0].includes("at new "); //是否调用构造对象函数
            if (isConstructor) {
                let path = match[1].replace(/\\/g, "/");
                let line = match[3], column = match[4];
                if (path.endsWith(".js") || path.endsWith(".cjs") || path.endsWith(".mjs")) {
                    //class在声明变量时赋初值, 构造函数中sourceMap解析会失败: 故此处尝试读取js.map文件手动解析
                    try {
                        let mapPath = path + ".map", tsPath;
                        let sourceMap = File.Exists(mapPath) ? JSON.parse(File.ReadAllText(mapPath)) : null;
                        if (sourceMap && Array.isArray(sourceMap.sources) && sourceMap.sources.length == 1) {
                            tsPath = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(path), sourceMap.sources[0]));
                        }
                        if (File.Exists(tsPath)) {
                            path = tsPath;
                            line = column = "0";
                            //尝试寻常class信息
                            let lines = File.ReadAllLines(tsPath);
                            for (let i = 0; i < lines.Length; i++) {
                                let content = lines.get_Item(i);
                                if (content.indexOf(`class ${className}`) >= 0 || content.indexOf(`function ${className}`) >= 0) {
                                    line = (i + 1).toString();
                                    break;
                                }
                            }
                        }
                    }
                    catch (e) {
                        console.warn(e);
                    }
                }
                modulePath = path;
                moduleName = path.substring(path.lastIndexOf("/") + 1);
                moduleLine = parseInt(line ?? "0");
                moduleColumn = parseInt(column ?? "0");
            }
            else if (modulePath) {
                break;
            }
        }
        let module = new CS.XOR.ModuleInfo();
        module.className = className;
        if (modulePath) {
            module.moduleName = moduleName;
            module.modulePath = modulePath;
            module.line = moduleLine;
            module.column = moduleColumn;
            module.stack = stack;
        }
        else {
            console.warn(`Unresolved Module: ${className}\n${stack}`);
        }
        this.component["Module"] = module;
    }
    //Getter 丶 Setter
    get transform() { return this.__transform__; }
    get gameObject() { return this.__gameObject__; }
    get enabled() { return this.component.enabled; }
    set enabled(value) { this.component.enabled = value; }
    get isActiveAndEnabled() { return this.component.isActiveAndEnabled; }
    get tag() { return this.__gameObject__.tag; }
    set tag(value) { this.__gameObject__.tag = value; }
    get name() { return this.__gameObject__.name; }
    set name(value) { this.__gameObject__.name = value; }
    get rectTransform() {
        if (!this.__transform__)
            return undefined;
        if (!("__rectTransform__" in this)) {
            this["__rectTransform__"] = this.__transform__ instanceof RectTransform ? this.__transform__ : null;
        }
        return this["__rectTransform__"];
    }
    get component() {
        if (!this.__component__ || this.__component__.Equals(null)) {
            this.__component__ = this.__gameObject__.GetComponent(puerts.$typeof(CS.XOR.TsBehaviour));
            if (!this.__component__ || this.__component__.Equals(null)) {
                this.__component__ = this.__gameObject__.AddComponent(puerts.$typeof(CS.XOR.TsBehaviour));
            }
        }
        return this.__component__;
    }
    ;
}
(function (TsBehaviourConstructor) {
    function toCSharpArray(array, checkMemberType = true) {
        if (!array || array.length === 0)
            return null;
        let firstIndex = array.findIndex(m => m !== undefined && m !== null && m !== void 0) ?? -1;
        if (firstIndex < 0)
            return null;
        let first = array[firstIndex];
        let results, type = typeof first, memberType;
        switch (type) {
            case "bigint":
                results = CS.System.Array.CreateInstance(puerts.$typeof(CS.System.Int64), array.length);
                break;
            case "number":
                results = CS.System.Array.CreateInstance(puerts.$typeof(CS.System.Double), array.length);
                break;
            case "string":
                results = CS.System.Array.CreateInstance(puerts.$typeof(CS.System.String), array.length);
                break;
            case "boolean":
                results = CS.System.Array.CreateInstance(puerts.$typeof(CS.System.Boolean), array.length);
                break;
            case "object":
                if (first instanceof CS.System.Object) {
                    results = CS.System.Array.CreateInstance(first.GetType(), array.length);
                }
                break;
        }
        if (results) {
            for (let i = 0; i < array.length; i++) {
                let value = array[i];
                if (checkMemberType) {
                    if (!memberType && typeof (value) !== type) {
                        continue;
                    }
                    if (memberType && (typeof (value) !== "object" ||
                        !(value instanceof CS.System.Object) ||
                        !memberType.IsAssignableFrom(value.GetType()))) {
                        continue;
                    }
                }
                results.SetValue(value, i);
            }
        }
        return results;
    }
    function toArray() {
        let array = arguments[0];
        if (!array)
            return null;
        let results = new Array();
        for (let i = 0; i < array.Length; i++) {
            results.push(array.GetValue(i));
        }
        return results;
    }
    const WatchFlag = Symbol("--watch--");
    const WatchFunctions = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
    function watch(obj, change) {
        if (!obj || !Array.isArray(obj))
            return obj;
        let functions = {};
        Object.defineProperty(obj, WatchFlag, {
            value: change,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        return new Proxy(obj, {
            get: function (target, property) {
                if (WatchFlag in target && WatchFunctions.includes(property)) {
                    if (!(property in functions)) {
                        functions[property] = new Proxy(Array.prototype[property], {
                            apply: function (target, thisArg, argArray) {
                                let result = target.apply(thisArg, argArray);
                                if (WatchFlag in thisArg) {
                                    thisArg[WatchFlag]();
                                }
                                return result;
                            }
                        });
                    }
                    return functions[property];
                }
                return target[property];
            },
            set: function (target, property, newValue) {
                target[property] = newValue;
                if (WatchFlag in target) {
                    target[WatchFlag]();
                }
                return true;
            }
        });
    }
    function unwatch(obj) {
        if (typeof (obj) !== "object")
            return;
        delete obj[WatchFlag];
    }
    /**获取IAccessor中的属性
     * @param accessor
     * @returns
     */
    function getAccessorProperties(accessor) {
        let results = {};
        let properties = accessor.GetProperties();
        if (properties && properties.Length > 0) {
            for (let i = 0; i < properties.Length; i++) {
                let { key, value } = properties.get_Item(i);
                if (value && value instanceof CS.System.Array) {
                    value = toArray(value);
                }
                results[key] = value;
            }
        }
        return results;
    }
    TsBehaviourConstructor.getAccessorProperties = getAccessorProperties;
    /**将C# IAccessor中的属性绑定到obj对象上
     * @param object
     * @param accessor
     * @param bind       运行时绑定
     */
    function bindAccessor(object, accessor, bind) {
        if (!accessor)
            return;
        let list = accessor instanceof CS.System.Array ? toArray(accessor) :
            Array.isArray(accessor) ? accessor : [accessor];
        for (let accessor of list) {
            if (!accessor || accessor.Equals(null))
                continue;
            let properties = getAccessorProperties(accessor), keys = Object.keys(properties);
            if (keys.length === 0)
                continue;
            if (isEditor && bind) {
                let set = (key, newValue) => {
                    unwatch(properties[key]);
                    properties[key] = watch(newValue, () => {
                        accessor.SetProperty(key, Array.isArray(newValue) ? toCSharpArray(newValue) : newValue);
                    });
                };
                accessor.SetPropertyListener((key, newValue) => {
                    if (newValue && newValue instanceof CS.System.Array) {
                        newValue = toArray(newValue);
                    }
                    set(key, newValue);
                });
                for (let key of keys) {
                    if (key in object) {
                        console.warn(`Object ${object}(${object["name"]}) already exists prop '${key}' ---> ${object[key]}`);
                    }
                    set(key, properties[key]);
                    Object.defineProperty(object, key, {
                        get: () => properties[key],
                        set: (newValue) => {
                            set(key, newValue);
                            accessor.SetProperty(key, Array.isArray(newValue) ? toCSharpArray(newValue) : newValue);
                        },
                        configurable: true,
                        enumerable: true,
                    });
                }
            }
            else {
                Object.assign(object, properties);
            }
        }
    }
    TsBehaviourConstructor.bindAccessor = bindAccessor;
    /**以独立组件的方式调用
     * 适用于Update丶LateUpdate和FixedUpdate方法, 默认以BatchProxy管理调用以满足更高性能要求
     * @returns
     */
    function standalone() {
        return (target, key) => {
            let proto = target.constructor.prototype;
            if (!(proto instanceof TsBehaviourConstructor)) {
                console.warn(`${target.constructor.name}: invaild decorator ${standalone.name}`);
                return;
            }
            Metadata.define(proto, key, standalone);
        };
    }
    TsBehaviourConstructor.standalone = standalone;
    /**跨帧调用(全局共用/非单独的frameskip分区)
     * 适用于Update丶LateUpdate和FixedUpdate方法, 仅允许BatchProxy管理调用(与standalone组件冲突)
     * (如你需要处理Input等事件, 那么就不应该使用它)
     * @param value  每n帧调用一次(<不包含>大于1时才有效)
     * @returns
     */
    function frameskip(value) {
        return (target, key) => {
            let proto = target.constructor.prototype;
            if (!(proto instanceof TsBehaviourConstructor)) {
                console.warn(`${target.constructor.name}: invaild decorator ${frameskip.name}`);
                return;
            }
            if (!Number.isInteger(value) || value <= 1) {
                console.warn(`${target.constructor.name}: invaild decorator parameter ${value} for ${frameskip.name}`);
                return;
            }
            Metadata.define(proto, key, frameskip, value);
        };
    }
    TsBehaviourConstructor.frameskip = frameskip;
    /**节流方法
     * 适用于async/Promise方法, 在上一次调用完成后才会再次调用(Awake丶Update丶FixedUpdate...)
     * @param enable
     * @returns
     */
    function throttle(enable) {
        return (target, key) => {
            let proto = target.constructor.prototype;
            if (!(proto instanceof TsBehaviourConstructor)) {
                console.warn(`${target.constructor.name}: invaild decorator ${throttle.name}`);
                return;
            }
            Metadata.define(proto, key, throttle, !!enable);
        };
    }
    TsBehaviourConstructor.throttle = throttle;
    /**注册侦听器
     * 适用于@see CS.XOR.TsMessages 回调
     * @param eventName
     * @returns
     */
    function listener(eventName) {
        return (target, key) => {
            let proto = target.constructor.prototype;
            if (!(proto instanceof TsBehaviourConstructor)) {
                console.warn(`${target.constructor.name}: invaild decorator ${listener.name}`);
                return;
            }
            Metadata.define(proto, key, listener, eventName ?? key);
        };
    }
    TsBehaviourConstructor.listener = listener;
})(TsBehaviourConstructor || (TsBehaviourConstructor = {}));
/**Update批量调用 */
class BatchProxy {
    static deltaTime() { return Time.deltaTime; }
    static fixedDeltaTime() { return Time.fixedDeltaTime; }
    static get Update() {
        return this._getter("__Update", CS.XOR.UpdateProxy, this.deltaTime);
    }
    ;
    static get FixedUpdate() {
        return this._getter("__FixedUpdate", CS.XOR.FixedUpdateProxy, this.fixedDeltaTime);
    }
    ;
    static get LateUpdate() {
        return this._getter("__LateUpdate", CS.XOR.LateUpdateProxy, this.deltaTime);
    }
    ;
    static _getter(key, type, timeGetter) {
        let proxy = this[key];
        if (!proxy) {
            let gameObject = this["_gameObject_"];
            if (!gameObject || gameObject.Equals(null)) {
                gameObject = new CS.UnityEngine.GameObject("SingletonUpdater");
                gameObject.transform.SetParent(CS.XOR.Application.GetInstance().transform);
                this["_gameObject_"] = gameObject;
            }
            proxy = new BatchProxy(gameObject.AddComponent(puerts.$typeof(type)), timeGetter);
            this[key] = proxy;
        }
        return proxy;
    }
    constructor(caller, timeGetter) {
        this.efHanlders = [];
        this.sfHandlers = new Map();
        this.caller = caller;
        this.caller.callback = (...args) => {
            let dt = timeGetter ? timeGetter() : 0;
            //每帧调用
            if (this.efHanlders.length > 0) {
                let _args = [...args, dt];
                for (let method of this.efHanlders) {
                    method.apply(undefined, _args);
                }
            }
            //跨帧调用
            for (const state of this.sfHandlers.values()) {
                state.dt += dt;
                if ((--state.tick) > 0)
                    continue;
                if (state.methods.length > 0) {
                    let _args = [...args, state.dt];
                    for (let method of state.methods) {
                        method.apply(undefined, _args);
                    }
                }
                state.tick = state.frameskip;
                state.dt = 0;
            }
        };
    }
    addListener(method, frameskip = 0) {
        if (frameskip > 1) {
            let state = this.sfHandlers.get(frameskip);
            if (!state) {
                state = { tick: frameskip, dt: 0, methods: [], frameskip };
                this.sfHandlers.set(frameskip, state);
            }
            state.methods.push(method);
        }
        else {
            this.efHanlders.push(method);
        }
    }
    removeListener(method, frameskip = 0) {
        const methods = frameskip > 1 ? this.sfHandlers.get(frameskip)?.methods : this.efHanlders;
        const idx = methods ? methods.indexOf(method) : -1;
        if (idx >= 0) {
            this.efHanlders.splice(idx, 1);
        }
    }
}
/**
 * 将对象与方法绑定
 */
function bind(thisArg, funcname, waitAsyncComplete) {
    const func = typeof (funcname) === "string" ? thisArg[funcname] : funcname;
    if (func !== undefined && typeof (func) === "function") {
        //return (...args: any[]) => func.call(thisArg, ...srcArgs, ...args);
        if (waitAsyncComplete) {
            let executing = false;
            return function (...args) {
                if (executing)
                    return;
                let result = func.call(thisArg, ...args);
                if (result instanceof Promise) {
                    executing = true; //wait async function finish
                    result.finally(() => executing = false);
                }
                return result;
            };
        }
        return function (...args) {
            return func.call(thisArg, ...args);
        };
    }
    return undefined;
}
/**调用方法并catch error
 * @param func
 * @param thisArg
 * @param args
 */
function call(thisArg, func, args) {
    try {
        func.apply(thisArg, args);
    }
    catch (e) {
        console.error(e.message + "\n" + e.stack);
    }
}
/**创建C#迭代器 */
function cs_generator(func, ...args) {
    let generator = undefined;
    if (typeof (func) === "function") {
        generator = func(...args);
        if (generator === null || generator === undefined || generator === void 0)
            throw new Error("Function '" + func?.name + "' no return Generator");
    }
    else {
        generator = func;
    }
    return CS.XOR.IEnumeratorUtil.Generator(function () {
        let tick;
        try {
            let next = generator.next();
            tick = new CS.XOR.IEnumeratorUtil.Tick(next.value, next.done);
        }
        catch (e) {
            tick = new CS.XOR.IEnumeratorUtil.Tick(null, true);
            console.error(e.message + "\n" + e.stack);
        }
        return tick;
    });
}
const MATEDATA_INFO = Symbol("__MATEDATA_INFO__");
const Metadata = {
    define(proto, key, attribute, data) {
        let matedatas = proto[MATEDATA_INFO];
        if (!matedatas) {
            matedatas = proto[MATEDATA_INFO] = {};
        }
        let attributes = matedatas[key];
        if (!attributes) {
            attributes = matedatas[key] = [];
        }
        attributes.push({ attribute, data });
    },
    getKeys(proto) {
        let matedatas = proto[MATEDATA_INFO];
        return matedatas ? Object.keys(matedatas) : [];
    },
    isDefine(proto, key, attribute) {
        let matedatas = proto[MATEDATA_INFO];
        if (!matedatas) {
            return false;
        }
        let attributes = matedatas[key];
        if (!attributes) {
            return false;
        }
        return !!attributes.find(define => define.attribute === attribute);
    },
    getDefineData(proto, key, attribute, defaultValue) {
        let matedatas = proto[MATEDATA_INFO];
        if (!matedatas) {
            return defaultValue;
        }
        let attributes = matedatas[key];
        if (!attributes) {
            return defaultValue;
        }
        return attributes.find(define => define.attribute === attribute)?.data ?? defaultValue;
    }
};
function register() {
    let _g = (global ?? globalThis ?? this);
    _g.xor = _g.xor || {};
    _g.xor.TsBehaviour = TsBehaviourConstructor;
}
register();
export {};
//# sourceMappingURL=behaviour.js.map