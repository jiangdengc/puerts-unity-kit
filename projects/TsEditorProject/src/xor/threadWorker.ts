import * as csharp from "csharp";
import { $generic } from "puerts";
let List_Object = $generic(csharp.System.Collections.Generic.List$1, csharp.System.Object) as {
    new(): csharp.System.Collections.Generic.List$1<csharp.System.Object>
};

const CLOSE_EVENT_NAME = "__e_close",
    REMOTE_EVENT_NAME = "__e_remote";

/**
 * 跨JsEnv实例交互封装
 */
class ThreadWorkerImpl {
    private readonly mainThread: boolean;
    private readonly worker: csharp.XOR.ThreadWorker;
    private readonly events: Map<string, Function[]>;

    constructor(loader: csharp.Puerts.ILoader, options?: csharp.XOR.ThreadWorker.CreateOptions) {
        if (loader instanceof csharp.XOR.ThreadWorker) {
            this.worker = loader;
            this.mainThread = false;
        } else {
            this.worker = csharp.XOR.ThreadWorker.Create(loader, options);
            this.mainThread = true;
        }
        this.worker.VerifyThread(this.mainThread);
        this.events = new Map();
        this.register();
    }
    public start(filepath: string) {
        if (!this.mainThread || XOR.globalWorker && XOR.globalWorker.worker === this.worker)
            throw new Error("Invalid operation ");
        this.worker.Run(filepath);
    }
    public stop() {
        if (this.mainThread) {
            this.events.clear();
            this.worker.Dispose();
        } else {
            this.post(CLOSE_EVENT_NAME);
        }
    }
    /**异步调用事件, 无返回值
     * @param eventName 
     * @param data 
     */
    public post(eventName: string, data?: any): void {
        let edata: csharp.XOR.ThreadWorker.EventData;
        if (data !== undefined && data !== null && data !== void 0) {
            edata = this.pack(data);
        }
        if (this.mainThread) {
            this.worker.PostToChildThread(eventName, edata);
        } else {
            this.worker.PostToMainThread(eventName, edata);
        }
    }
    /**同步调用事件, 并立即获取返回值
     * @param eventName 
     * @param data 
     * @param throwOnError      
     * @returns 
     */
    public postSync<T = any>(eventName: string, data?: any, throwOnError: boolean = true): T {
        let edata: csharp.XOR.ThreadWorker.EventData;
        if (data !== undefined && data !== null && data !== void 0) {
            edata = this.pack(data);
        }
        let result: T;
        if (this.mainThread) {
            edata = this.worker.Syncr.PostToChildThread(eventName, edata, throwOnError);
        } else {
            edata = this.worker.Syncr.PostToMainThread(eventName, edata, throwOnError);
        }
        //Result
        if (edata !== undefined && edata !== null && edata !== void 0) {
            result = this.unpack(edata);
        }
        return null;
    }
    /**执行一段代码, 只能由主线程调用
     * @param chunk 
     * @param chunkName 
     */
    public eval(chunk: string, chunkName?: string) {
        if (!this.mainThread || XOR.globalWorker && XOR.globalWorker.worker === this.worker)
            throw new Error("Invalid operation ");
        this.worker.PostEvalToChildThread(chunk, chunkName);
    }

    /**监听ThreadWorker close消息(从子线程中请求), 只能由主线程处理, 返回flase将阻止ThreadWorker实例销毁
     * @param eventName 
     * @param fn 
     */
    public on(eventName: typeof CLOSE_EVENT_NAME, fn: () => void | false): void;
    /**监听事件信息
     * @param eventName 
     * @param fn 
     */
    public on<T = any, TResult = void>(eventName: string, fn: (data?: T) => TResult): void;
    public on() {
        let eventName: string = arguments[0], fn: Function = arguments[1];
        if (eventName && fn) {
            let funcs = this.events.get(eventName);
            if (!funcs) {
                funcs = [];
                this.events.set(eventName, funcs);
            }
            funcs.push(fn);
        }
    }
    /**移除指定监听事件 */
    public remove(eventName: string, fn: Function) {
        let funcs = this.events.get(eventName);
        if (funcs) {
            let idx = funcs.indexOf(fn);
            if (idx >= 0) {
                funcs.splice(idx, 1);
            }
        }
    }
    /**移除所有监听事件 */
    public removeAll(eventName?: string) {
        if (eventName)
            this.events.delete(eventName);
        else
            this.events.clear();
    }

    private register() {
        let getValue = (data: csharp.XOR.ThreadWorker.EventData) => {
            if (data !== undefined && data !== null && data !== void 0) {
                return this.unpack(data);
            }
            return null;
        };
        let onmessage = (eventName: string, data: csharp.XOR.ThreadWorker.EventData, hasReturn: boolean = true): csharp.XOR.ThreadWorker.EventData => {
            let result: any;

            let funcs = this.events.get(eventName);
            if (funcs) {
                let _data = getValue(data);
                for (let fn of funcs) {
                    result = fn(_data) || result;
                }
            }
            if (hasReturn && result !== undefined && result !== null && result !== void 0)
                return this.pack(result);
            return null;
        };
        if (this.mainThread) {
            this.worker.MainThreadHandler = (eventName, data) => {
                switch (eventName) {
                    case CLOSE_EVENT_NAME:
                        {
                            let closing = true;
                            let funcs = this.events.get(CLOSE_EVENT_NAME);
                            if (funcs) {
                                let _data = getValue(data);
                                for (let fn of funcs) {
                                    if (fn(_data) === false) {
                                        closing = false;
                                    }
                                }
                            }
                            if (closing) this.stop();
                            return this.pack(closing);
                        }
                        break;
                    case REMOTE_EVENT_NAME:
                        {
                            let _data = (<string>getValue(data));
                            if (typeof _data !== "string")
                                return null;

                            let value = csharp;
                            (<string>getValue(data)).split(".").forEach(name => {
                                if (value && name) value = value[name];
                            });
                            let t = typeof (value);
                            if (t !== "undefined" && t !== "object" && t !== "function") {
                                return this.pack(value);
                            }
                            return null;
                        }
                        break;
                    default:
                        return onmessage(eventName, data);
                        break;
                }
            };
        } else {
            this.worker.ChildThreadHandler = onmessage;
            if (this.worker.Options && this.worker.Options.Remote) {
                this.registerRemoteProxy();
            }
        }
    }
    //创建remote proxy, 实现在子线程内访问Unity Api
    private registerRemoteProxy() {
        let createProxy = (namespace: string) => {
            return new Proxy(Object.create(null), {
                get: (cache, name) => {
                    if (!(name in cache) && typeof (name) === "string") {
                        let fullName = namespace ? (namespace + '.' + name) : name;
                        //同步调用Unity Api
                        if (fullName.startsWith("UnityEngine") && fullName !== "UnityEngine.Debug") {
                            let cls = this.postSync(REMOTE_EVENT_NAME, fullName);
                            if (cls) {
                                cache[name] = cls;
                            }
                            else {
                                cache[name] = createProxy(fullName);
                            }
                        } else {
                            let value = csharp;
                            fullName.split(".").forEach(name => {
                                if (value && name) { value = value[name]; }
                            });
                            cache[name] = value;
                        }
                    }
                    return cache[name];
                }
            });
        }
        let puerts = require("puerts");
        puerts.registerBuildinModule('csharp', createProxy(undefined));
    }

    private pack(data: any): csharp.XOR.ThreadWorker.EventData {
        switch (this._validate(data)) {
            case 0:
                {
                    let result = new csharp.XOR.ThreadWorker.EventData();
                    if (typeof (data) === "object") {
                        result.Type = csharp.XOR.ThreadWorker.ValueType.JSON;
                        result.Value = JSON.stringify(data);
                    } else {
                        result.Type = csharp.XOR.ThreadWorker.ValueType.Value;
                        result.Value = data;
                    }
                }
                break;
            case 1:
                return this._packByRefs(data, { objs: new WeakMap(), id: 1 });
                break;
            case 2:
                throw new Error("unsupport data");
                break;
        }
        return null;
    }
    private unpack(data: csharp.XOR.ThreadWorker.EventData): any {
        switch (data.Type) {
            case csharp.XOR.ThreadWorker.ValueType.JSON:
                return JSON.parse(data.Value) ?? data.Value;
                break;
            default:
                return this._unpackByRefs(data, new Map());
                break;
        }
        return null;
    }
    private _packByRefs(data: any, refs: { objs: WeakMap<object, number>, id: number }): csharp.XOR.ThreadWorker.EventData {
        let result = new csharp.XOR.ThreadWorker.EventData();

        let t = typeof (data);
        if (t === "object" && refs.objs.has(data)) {
            result.Type = csharp.XOR.ThreadWorker.ValueType.RefObject;
            result.Value = refs.objs.get(data) ?? -1;
        } else {
            switch (t) {
                case "object":
                    //添加对象引用
                    let id = refs.id++;
                    refs.objs.set(data, id);
                    //创建对象引用
                    result.Id = id;
                    if (data instanceof csharp.System.Object) {
                        result.Type = csharp.XOR.ThreadWorker.ValueType.Value;
                        result.Value = data;
                    }
                    else if (data instanceof ArrayBuffer) {
                        result.Type = csharp.XOR.ThreadWorker.ValueType.ArrayBuffer;
                        result.Value = csharp.XOR.BufferUtil.ToBytes(data);
                    }
                    else if (Array.isArray(data)) {
                        let list = new List_Object();
                        for (let i = 0; i < data.length; i++) {
                            let member = this._packByRefs(data[i], refs);
                            member.Key = i;
                            list.Add(member);
                        }
                        result.Type = csharp.XOR.ThreadWorker.ValueType.Array;
                        result.Value = list;
                    } else {
                        let list = new List_Object();
                        Object.keys(data).forEach(key => {
                            let item = this._packByRefs(data[key], refs);
                            item.Key = key;
                            list.Add(item);
                        });
                        result.Type = csharp.XOR.ThreadWorker.ValueType.Object;
                        result.Value = list;
                    }
                    break;
                case "string":
                case "number":
                case "bigint":
                case "boolean":
                    result.Type = csharp.XOR.ThreadWorker.ValueType.Value;
                    result.Value = data;
                    break;
                default:
                    result.Type = csharp.XOR.ThreadWorker.ValueType.Unknown;
                    break;
            }
        }
        return result;
    }
    private _unpackByRefs(data: csharp.XOR.ThreadWorker.EventData, refs: Map<number, object>) {
        const { Type, Value, Id } = data;

        let result: any;
        switch (Type) {
            case csharp.XOR.ThreadWorker.ValueType.Object:
                {
                    result = {};
                    if (Id > 0) refs.set(Id, result);                   //add object ref
                    let list = Value as csharp.System.Collections.Generic.List$1<csharp.XOR.ThreadWorker.EventData>;
                    for (let i = 0; i < list.Count; i++) {
                        let member = list.get_Item(i);
                        result[member.Key] = this._unpackByRefs(member, refs);
                    }
                }
                break;
            case csharp.XOR.ThreadWorker.ValueType.Array:
                {
                    result = [];
                    if (Id > 0) refs.set(Id, result);                   //add object ref
                    let list = Value as csharp.System.Collections.Generic.List$1<csharp.XOR.ThreadWorker.EventData>;
                    for (let i = 0; i < list.Count; i++) {
                        let member = list.get_Item(i);
                        result[member.Key] = this._unpackByRefs(member, refs);
                    }
                }
                break;
            case csharp.XOR.ThreadWorker.ValueType.ArrayBuffer:
                result = csharp.XOR.BufferUtil.ToBuffer(Value);
                if (Id > 0) refs.set(Id, result);                       //add object ref
                break;
            case csharp.XOR.ThreadWorker.ValueType.RefObject:
                if (refs.has(Value)) {
                    result = refs.get(Value);
                } else {
                    result = `Error: ref id ${Value} not found`;
                }
                break;
            case csharp.XOR.ThreadWorker.ValueType.JSON:
                result = JSON.parse(data.Value);
                if (Id > 0) refs.set(Id, result);                       //add object ref
                break;
            default:
                result = Value;
                if (Id > 0) refs.set(Id, result);                       //add object ref
                break;
        }
        return result;
    }
    /**验证data数据
     * @param data 
     * @returns 0:纯json数据, 1:引用UnityObject, 2:包含js functon/js symbol等参数
     */
    private _validate(data: any, refs?: WeakSet<object>,): 0 | 1 | 2 {
        let t = typeof (data);
        switch (t) {
            case "object":
                if (data instanceof csharp.System.Object ||
                    data instanceof ArrayBuffer
                ) {
                    return 1;
                }

                if (!refs) refs = new WeakSet();
                if (refs.has(data)) {   //引用自身
                    return 1;
                }
                refs.add(data);
                if (Array.isArray(data)) {
                    for (let _d of data) {
                        let t = this._validate(_d, refs);
                        if (t > 0) return t;
                    }
                } else {
                    for (let key of Object.keys(data)) {
                        let t = this._validate(key, refs);
                        if (t > 0) return t;

                        t = this._validate(data[key], refs);
                        if (t > 0) return t;
                    }
                }
                break;
            case "symbol":
            case "function":
                return 2;
                break;
        }
        return 0;
    }
}
(function () {
    let _g = (global ?? globalThis ?? this);
    _g["ThreadWorker"] = ThreadWorkerImpl;
    _g["globalWorker"] = undefined;
})();

function register() {
    let _g = (global ?? globalThis ?? this);
    _g.XOR = _g.XOR || {};
    _g.XOR["ThreadWorker"] = ThreadWorkerImpl;
    _g.XOR["globalWorker"] = undefined;
}
register();

/**接口声明 */
declare global {
    namespace XOR {
        class ThreadWorker extends ThreadWorkerImpl { }

        /**
         * 只能在JsWorker内部访问, 与主线程交互的对象
         */
        const globalWorker: ThreadWorkerImpl;
    }
}