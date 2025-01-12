import Transform = CS.UnityEngine.Transform;
import GameObject = CS.UnityEngine.GameObject;
import RectTransform = CS.UnityEngine.RectTransform;
import Application = CS.UnityEngine.Application;
import PointerEventData = CS.UnityEngine.EventSystems.PointerEventData;
import Collision = CS.UnityEngine.Collision;
import Collision2D = CS.UnityEngine.Collision2D;
import Collider = CS.UnityEngine.Collider;
import Collider2D = CS.UnityEngine.Collider2D;
import Time = CS.UnityEngine.Time;
import CSObject = CS.System.Object;

const { File, Path } = CS.System.IO;
const isEditor = Application.isEditor;

type AccessorType = CS.UnityEngine.Component & CS.XOR.Serializables.IAccessor;
type AccessorUnionType = AccessorType | AccessorType[] | CS.System.Array$1<AccessorType>;

type ConstructorEvent = <T extends TsBehaviourConstructor = any>(this: T) => void;
type ConstructorOptions = {
    accessor?: AccessorUnionType | boolean;
    /**传递给onConstructor的参数 */
    args?: any[];
    /**在绑定Unity生命周期之前调用 */
    before?: ConstructorEvent;
    /**在绑定Unity生命周期之后调用 */
    after?: ConstructorEvent;
};

/**
 * 详情参阅: https://docs.unity3d.com/cn/current/ScriptReference/MonoBehaviour.html
 */
abstract class IBehaviour {
    /**
     * 创建实例时被调用 
     */
    protected onConstructor?(...args: any[]): void;

    /**
     * Awake在加载脚本实例时调用。
     * (如果游戏对象在启动期间处于非活动状态，则在激活之后才会调用 Awake。)
     */
    protected Awake?(): void;
    /**
     * 仅当启用脚本实例后，才会在第一次帧更新之前调用 Start。 
     */
    protected Start?(): void;
    /**
     * (仅在对象处于激活状态时调用)在启用对象后立即调用此函数。
     * 在创建 MonoBehaviour 实例时（例如加载关卡或实例化具有脚本组件的游戏对象时）会执行此调用。
     */
    protected OnEnable?(): void;
    /**
     * 行为被禁用或处于非活动状态时，调用此函数。 
     */
    protected OnDisable?(): void;
    /**
     * 对象存在的最后一帧完成所有帧更新之后，调用此函数（可能应 Object.Destroy 要求或在场景关闭时销毁该对象）。 
     */
    protected OnDestroy?(): void;


    /**
     * 每帧调用一次 Update。这是用于帧更新的主要函数。 
     * @param deltaTime 批量调用时将传参此值
     */
    protected Update?(deltaTime?: number): void;
    /**
     * 用于物理计算且独立于帧率的 MonoBehaviour.FixedUpdate 消息。
     * 调用 FixedUpdate 的频度常常超过 Update。如果帧率很低，可以每帧调用该函数多次；
     * 如果帧率很高，可能在帧之间完全不调用该函数。在 FixedUpdate 之后将立即进行所有物理计算和更新。在 FixedUpdate 内应用运动计算时，无需将值乘以 Time.deltaTime。这是因为 FixedUpdate 的调用基于可靠的计时器（独立于帧率）。
     * @param deltaTime 批量调用时将传参此值
     */
    protected FixedUpdate?(deltaTime?: number): void;
    /**
     * 每帧调用一次 LateUpdate（在 Update完成后）。
     * LateUpdate 开始时，在 Update 中执行的所有计算便已完成。LateUpdate 的常见用途是跟随第三人称摄像机。如果在 Update 内让角色移动和转向，可以在 LateUpdate 中执行所有摄像机移动和旋转计算。这样可以确保角色在摄像机跟踪其位置之前已完全移动。
     * @param deltaTime 批量调用时将传参此值
     */
    protected LateUpdate?(deltaTime?: number): void;


    /**
     * 每帧调用多次以响应 GUI 事件。首先处理布局和重新绘制事件，然后为每个输入事件处理布局和键盘/鼠标事件。
     */
    protected OnGUI?(): void;
    /**
     * 在退出应用程序之前在所有游戏对象上调用此函数。在编辑器中，用户停止播放模式时，调用函数。
     */
    protected OnApplicationQuit?(): void;
    /**
     * 
     * @param focus 
     */
    protected OnApplicationFocus?(focus: boolean): void;
    /**
     * 在帧的结尾处调用此函数（在正常帧更新之间有效检测到暂停）。
     * 在调用 OnApplicationPause 之后，将发出一个额外帧，从而允许游戏显示图形来指示暂停状态。
     * @param pause 
     */
    protected OnApplicationPause?(pause: boolean): void;
}
abstract class IGizmos {
    /**
     * (仅Editor可用)
     * Gizmos 类允许您将线条、球体、立方体、图标、纹理和网格绘制到 Scene 视图中，在开发项目时用作调试、设置的辅助手段或工具。
     * Handles 类似于 Gizmos，但在交互性和操作方面提供了更多功能。Unity 本身提供的用于在 Scene 视图中操作项目的 3D 控件是 Gizmos 和 Handles 的组合。内置的 Handle GUI 有很多，如通过变换组件定位、缩放和旋转对象等熟悉的工具。不过，您可以自行定义 Handle GUI，以与自定义组件编辑器结合使用。此类 GUI 对于编辑以程序方式生成的场景内容、“不可见”项和相关对象的组（如路径点和位置标记）非常实用。
     */
    protected OnDrawGizmosSelected?(): void;
    /**(仅Editor可用)*/
    protected OnSceneGUI?(): void;
}
abstract class IOnPointerHandler {
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerClickHandler
     * @see CS.UnityEngine.EventSystems.IPointerClickHandler
     * @param eventData 
     */
    protected OnPointerClick?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerDownHandler
     * @see CS.UnityEngine.EventSystems.IPointerDownHandler
     * @param eventData 
     */
    protected OnPointerDown?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerUpHandler
     * @see CS.UnityEngine.EventSystems.IPointerUpHandler
     * @param eventData 
     */
    protected OnPointerUp?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerEnterHandler
     * @see CS.UnityEngine.EventSystems.IPointerEnterHandler
     * @param eventData 
     */
    protected OnPointerEnter?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerExitHandler
     * @see CS.UnityEngine.EventSystems.IPointerExitHandler
     * @param eventData 
     */
    protected OnPointerExit?(eventData: PointerEventData): void;
}
abstract class IOnDragHandler {
    /**
     * 实现C#接口: UnityEngine.EventSystems.IBeginDragHandler
     * @see CS.UnityEngine.EventSystems.IBeginDragHandler
     * @param eventData 
     */
    protected OnBeginDrag?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IDragHandler
     * @see CS.UnityEngine.EventSystems.IDragHandler
     * @param eventData 
     */
    protected OnDrag?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IEndDragHandler
     * @see CS.UnityEngine.EventSystems.IEndDragHandler
     * @param eventData 
     */
    protected OnEndDrag?(eventData: PointerEventData): void;

}
abstract class IOnCollision {
    /**
     * Collision组件事件回调(Enter)
     * @param collision 
     */
    protected OnCollisionEnter?(collision: Collision): void;
    /**
     * Collision组件事件回调(Stay)
     * @param collision 
     */
    protected OnCollisionStay?(collision: Collision): void;
    /**
     * Collision组件事件回调(Exit)
     * @param collision 
     */
    protected OnCollisionExit?(collision: Collision): void;

}
abstract class IOnCollision2D {
    /**
     * Collision2D组件事件回调(Enter)
     * @param collision 
     */
    protected OnCollisionEnter2D?(collision: Collision2D): void;
    /**
     * Collision2D组件事件回调(Stay)
     * @param collision 
     */
    protected OnCollisionStay2D?(collision: Collision2D): void;
    /**
     * Collision2D组件事件回调(Exit)
     * @param collision 
     */
    protected OnCollisionExit2D?(collision: Collision2D): void;

}
abstract class IOnTrigger {
    /**
     * Collider组件事件回调(Enter)
     * @param collider 
     */
    protected OnTriggerEnter?(collider: Collider): void;
    /**
     * Collider组件事件回调(Stay)
     * @param collider 
     */
    protected OnTriggerStay?(collider: Collider): void;
    /**
     * Collider组件事件回调(Exit)
     * @param collider 
     */
    protected OnTriggerExit?(collider: Collider): void;
}
abstract class IOnTrigger2D {
    /**
     * Collider2D组件事件回调(Enter)
     * @param collider 
     */
    protected OnTriggerEnter2D?(collider: Collider2D): void;
    /**
     * Collider2D组件事件回调(Stay)
     * @param collider 
     */
    protected OnTriggerStay2D?(collider: Collider2D): void;
    /**
     * Collider2D组件事件回调(Exit)
     * @param collider 
     */
    protected OnTriggerExit2D?(collider: Collider2D): void;
}
abstract class IOnMouse {
    /**
     * 当用户在 Collider 上按下鼠标按钮时，将调用 OnMouseDown。
     */
    protected OnMouseDown?(): void;
    /**
     * 当用户单击 Collider 并仍然按住鼠标时，将调用 OnMouseDrag。在按住鼠标按钮的情况下，每帧调用一次 OnMouseDrag。
     */
    protected OnMouseDrag?(): void;
    /**
     * 当鼠标进入 Collider 时调用。
     * 当鼠标停留在对象上时，调用相应的 OnMouseOver 函数； 当鼠标移开时，调用 OnMouseExit。
     */
    protected OnMouseEnter?(): void;
    /**
     * 当鼠标不再处于 Collider 上方时调用。OnMouseExit 调用跟随在相应的 OnMouseEnter 和 OnMouseOver 调用之后。
     * 在属于 Ignore Raycast 层的对象上，不调用该函数。
     * 当且仅当 Physics.queriesHitTriggers 为 true 时，才在标记为触发器的碰撞体上调用该函数。
     * 如果在函数中的某处添加 yield 语句，则可以将 OnMouseExit 用作协程。 此事件将发送至附加到 Collider 的所有脚本。
     */
    protected OnMouseExit?(): void;
    /**
     * 当鼠标悬停在 Collider 上时，每帧调用一次。
     * OnMouseEnter 在鼠标处于该对象上方的第一帧调用。 然后，每帧都调用 OnMouseOver，直到移开鼠标 - 此时，调用 OnMouseExit。
     * 在属于 Ignore Raycast 层的对象上，不调用该函数。
     * 当且仅当 Physics.queriesHitTriggers 为 true 时，才在标记为触发器的碰撞体上调用该函数。
     * OnMouseOver 可以是协程，在函数中只是使用 yield 语句。 此事件将发送至附加到 Collider 的所有脚本。
     */
    protected OnMouseOver?(): void;
    /**
     * 当用户松开鼠标按钮时，将调用 OnMouseUp。 
     * 请注意，即使鼠标不在按下鼠标时所在的 Collider 上，也会调用 OnMouseUp。 有关类似于按钮的行为，请参阅：OnMouseUpAsButton。
     */
    protected OnMouseUp?(): void;
    /**
     * 松开鼠标时，仅当鼠标在按下时所在的 Collider 上时，才调用 OnMouseUpAsButton。
     */
    protected OnMouseUpAsButton?(): void;
}

/**
 * 沿用C# MonoBehaviour习惯, 将OnEnable丶Update丶OnEnable等方法绑定到C#对象上, Unity将在生命周期内调用
 * 
 * 注: 为避免多次跨语言调用, Update丶FixedUpdate丶LateUpdate方法将由BatchProxy统一管理(并非绑定到各自的GameObject上)
 * @see standalone 如果需要绑定独立的组件, 在对应方法上添加此标注
 */
class TsBehaviourConstructor {
    private __transform__: Transform;
    private __gameObject__: GameObject;
    private __component__: CS.XOR.TsBehaviour;
    private __listeners__: Map<string, Function[]>;
    private __listenerProxy__: CS.XOR.TsMessages;

    public constructor(object: GameObject | Transform | CS.XOR.TsBehaviour, accessor?: AccessorUnionType | boolean);
    public constructor(object: GameObject | Transform | CS.XOR.TsBehaviour, options?: ConstructorOptions);
    public constructor() {
        let object: GameObject | Transform | CS.XOR.TsBehaviour = arguments[0],
            accessor: AccessorUnionType | boolean,
            args: any[],
            before: ConstructorEvent,
            after: ConstructorEvent;
        let p2 = arguments[1];
        switch (typeof (p2)) {
            case "object":
                if (p2 === null) { }
                else if (p2 instanceof CSObject || Array.isArray(p2)) {
                    accessor = <any>p2;
                } else {
                    accessor = (<ConstructorOptions>p2).accessor;
                    args = (<ConstructorOptions>p2).args;
                    before = (<ConstructorOptions>p2).before;
                    after = (<ConstructorOptions>p2).after;
                }
                break;
            case "boolean":
                accessor = <any>p2;
                break;
        }

        let gameObject: GameObject;
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
            TsBehaviourConstructor.bindAccessor(
                this,
                object.GetComponents(puerts.$typeof(CS.XOR.TsProperties)) as CS.System.Array$1<CS.XOR.TsProperties>,
                true
            );
        }
        else if (accessor) {
            TsBehaviourConstructor.bindAccessor(
                this,
                accessor,
                true
            );
        }
        //call constructor
        let onctor: Function = this["onConstructor"];
        if (onctor && typeof (onctor) === "function") {
            call(this, onctor, args);
        }

        //call before callback
        if (before) call(this, before);

        this._bindProxies();
        this._bindUpdateProxies();
        this._bindListeners();
        this._bindModuleOfEditor();

        //call after callback
        if (after) call(this, after);
    }
    //协程
    public StartCoroutine(routine: ((...args: any[]) => Generator) | Generator, ...args: any[]): CS.UnityEngine.Coroutine {
        //传入了js Generator方法, 转为C#迭代器对象
        var iterator = cs_generator(routine, ...args);
        return this.component.StartCoroutine(iterator);
    }
    public StopCoroutine(routine: CS.UnityEngine.Coroutine) {
        this.component.StopCoroutine(routine);
    }
    public StopAllCoroutines() {
        this.component.StopAllCoroutines();
    }

    /**添加Unity Message listener
     * @param eventName 
     * @param fn 
     */
    protected addListener(eventName: string, fn: Function) {
        //create message proxy
        if (!this.__listenerProxy__ || this.__listenerProxy__.Equals(null)) {
            this.__listenerProxy__ = (
                this.__gameObject__.GetComponent(puerts.$typeof(CS.XOR.TsMessages)) ??
                this.__gameObject__.AddComponent(puerts.$typeof(CS.XOR.TsMessages))
            ) as CS.XOR.TsMessages;
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
    protected removeListener(eventName: string, fn: Function) {
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
        } else {
            this.__listeners__.delete(eventName);
            if (this.__listeners__.size === 0)
                this.clearListeners();
        }
    }
    /**移除所有Unity Message listener
     * @param eventName 
     */
    protected removeAllListeners(eventName: string) {
        if (!this.__listeners__)
            return;
        if (eventName === undefined || eventName === null || eventName === void 0)
            eventName = '';
        this.__listeners__.delete(eventName);
        if (this.__listeners__.size === 0)
            this.clearListeners();
    }
    /**清空Unity Message listener */
    protected clearListeners() {
        if (!this.__listeners__)
            return;
        this.__listeners__ = null;
        this.__listenerProxy__.callback = null;
        this.__listenerProxy__.emptyCallback = null;
    }
    private _invokeListeners(eventName: string, args?: Array<any> | CS.System.Array$1<any>) {
        if (!this.__listeners__) {
            console.warn(`invail invoke: ${eventName}`);
            return;
        }
        let functions = this.__listeners__.get(eventName);
        if (!functions)
            return;

        if (args instanceof CS.System.Array) {
            let _args = new Array<any>();
            for (let i = 0; i < args.Length; i++) {
                _args.push(args.get_Item(i));
            }
            args = _args;
        }
        functions.forEach(fn => fn.apply(undefined, args));
    }

    //protected
    protected disponse() {
        this.__gameObject__ = undefined;
        this.__transform__ = undefined;
        this.__component__ = undefined;
    }
    //绑定Proxy方法
    private _bindProxies() {
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
        const proxyCfg: [string, string, string, string][] = [
            ["CreateProxyForDrag", "OnBeginDrag", "OnDrag", "OnEndDrag"],

            ["CreateProxyForCollision", "OnCollisionEnter", "OnCollisionStay", "OnCollisionExit"],
            ["CreateProxyForCollision2D", "OnCollisionEnter2D", "OnCollisionStay2D", "OnCollisionExit2D"],
            ["CreateProxyForTrigger", "OnTriggerEnter", "OnTriggerStay", "OnTriggerExit"],
            ["CreateProxyForTrigger2D", "OnTriggerEnter2D", "OnTriggerStay2D", "OnTriggerExit2D"],
        ]
        proxyCfg.forEach(cfg => {
            let [funcname, funcEnter, funcStay, funcExit] = cfg;
            let enter: Function = bind(this, funcEnter),
                stay: Function = bind(this, funcStay),
                exit: Function = bind(this, funcExit);
            if (enter || stay || exit)
                this.component[funcname](enter, stay, exit);
        });
    }
    private _bindUpdateProxies() {

        let proto = Object.getPrototypeOf(this);
        //Update方法
        const proxies: [func: Function, proxy: BatchProxy, frameskip: number][] = (<[string, BatchProxy][]>[
            ["Update", BatchProxy.Update],
            ["LateUpdate", BatchProxy.LateUpdate],
            ["FixedUpdate", BatchProxy.FixedUpdate],
        ]).map(([funcname, proxy]) => {
            let waitAsyncComplete = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.throttle, false);
            let func: Function = bind(this, funcname, waitAsyncComplete);
            if (!func) {
                return null;
            }
            if (Metadata.isDefine(proto, funcname, TsBehaviourConstructor.standalone)) {
                this.component.CreateProxy(funcname, func as CS.System.Action);
                return undefined
            }
            let frameskip = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.frameskip, 0);
            return <[Function, BatchProxy, number]>[func, proxy, frameskip];
        }).filter(o => !!o);

        if (proxies.length > 0) {
            let enabled = false;
            let enable = function () {
                if (enabled) return;
                enabled = true;
                proxies.forEach(([func, batch, frameskip]) => batch.addListener(func, frameskip));
            };
            let disable = function () {
                if (!enabled) return;
                enabled = false;
                proxies.forEach(([func, batch, frameskip]) => batch.removeListener(func, frameskip));
            };
            //生命周期管理
            let proxy = this.component.GetProxy("OnEnable") as CS.XOR.ProxyAction;
            if (!proxy || proxy.Equals(null))
                this.component.CreateProxy("OnEnable", enable);
            else {
                proxy.callback = CS.System.Delegate.Combine(proxy.callback, new CS.System.Action(enable)) as CS.System.Action;
            }
            proxy = this.component.GetProxy("OnDisable") as CS.XOR.ProxyAction;
            if (!proxy || proxy.Equals(null))
                this.component.CreateProxy("OnDisable", disable);
            else {
                proxy.callback = CS.System.Delegate.Combine(proxy.callback, new CS.System.Action(disable)) as CS.System.Action;
            }

            proxy = this.component.GetProxy("OnDestroy") as CS.XOR.ProxyAction;
            if (!proxy || proxy.Equals(null))
                this.component.CreateProxy("OnDestroy", disable);
            else {
                proxy.callback = CS.System.Delegate.Combine(proxy.callback, new CS.System.Action(disable)) as CS.System.Action;
            }
        };
    }
    private _bindListeners() {
        let proto = Object.getPrototypeOf(this);
        for (let funcname of Metadata.getKeys(proto)) {
            let eventName = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.listener);
            if (!eventName)
                continue;
            let waitAsyncComplete = Metadata.getDefineData(proto, funcname, TsBehaviourConstructor.throttle, false);
            let func: CS.System.Action = bind(this, funcname, waitAsyncComplete);
            if (!func)
                return undefined;
            this.addListener(eventName, func);
        }
    }
    //绑定脚本内容
    private _bindModuleOfEditor() {
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

        let moduleName: string, modulePath: string, moduleLine: number, moduleColumn: number;
        //匹配new构造函数
        //let regex = /at [a-zA-z0-9#$._ ]+ \(([a-zA-Z0-9:/\\._ ]+(.js|.ts))\:([0-9]+)\:([0-9]+)\)/g;
        let regex = /at [a-zA-z0-9#$._ ]+ \(([^\n\r\*\"\|\<\>]+(.js|.cjs|.mjs|.ts|.mts))\:([0-9]+)\:([0-9]+)\)/g;
        let match: RegExpExecArray;
        while (match = regex.exec(stack)) {
            let isConstructor = match[0].includes("at new ");   //是否调用构造对象函数
            if (isConstructor) {
                let path = match[1].replace(/\\/g, "/");
                let line = match[3], column = match[4];
                if (path.endsWith(".js") || path.endsWith(".cjs") || path.endsWith(".mjs")) {
                    //class在声明变量时赋初值, 构造函数中sourceMap解析会失败: 故此处尝试读取js.map文件手动解析
                    try {
                        let mapPath = path + ".map", tsPath: string;
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
                    } catch (e) { console.warn(e); }
                }

                modulePath = path;
                moduleName = path.substring(path.lastIndexOf("/") + 1);
                moduleLine = parseInt(line ?? "0");
                moduleColumn = parseInt(column ?? "0");
            } else if (modulePath) {
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
        } else {
            console.warn(`Unresolved Module: ${className}\n${stack}`);
        }
        this.component["Module"] = module;
    }

    //Getter 丶 Setter
    public get transform() { return this.__transform__; }
    public get gameObject() { return this.__gameObject__; }
    public get enabled() { return this.component.enabled; }
    public set enabled(value: boolean) { this.component.enabled = value; }
    public get isActiveAndEnabled() { return this.component.isActiveAndEnabled; }
    public get tag() { return this.__gameObject__.tag; }
    public set tag(value: string) { this.__gameObject__.tag = value; }
    public get name() { return this.__gameObject__.name; }
    public set name(value: string) { this.__gameObject__.name = value; }
    public get rectTransform() {
        if (!this.__transform__)
            return undefined;
        if (!("__rectTransform__" in this)) {
            this["__rectTransform__"] = this.__transform__ instanceof RectTransform ? this.__transform__ : null;
        }
        return this["__rectTransform__"] as RectTransform;
    }
    protected get component() {
        if (!this.__component__ || this.__component__.Equals(null)) {
            this.__component__ = this.__gameObject__.GetComponent(puerts.$typeof(CS.XOR.TsBehaviour)) as CS.XOR.TsBehaviour;
            if (!this.__component__ || this.__component__.Equals(null)) {
                this.__component__ = this.__gameObject__.AddComponent(puerts.$typeof(CS.XOR.TsBehaviour)) as CS.XOR.TsBehaviour;
            }
        }
        return this.__component__;
    };
}
//无实际意义: 仅作为继承子类提示接口名称用
interface TsBehaviourConstructor extends IBehaviour, IGizmos, IOnPointerHandler, IOnDragHandler, IOnMouse, IOnCollision, IOnCollision2D, IOnTrigger, IOnTrigger2D {
}

namespace TsBehaviourConstructor {
    function toCSharpArray<T>(array: Array<T>, checkMemberType: boolean = true): CS.System.Array$1<T> {
        if (!array || array.length === 0)
            return null;
        let firstIndex = array.findIndex(m => m !== undefined && m !== null && m !== void 0) ?? -1;
        if (firstIndex < 0)
            return null;
        let first = array[firstIndex];
        let results: CS.System.Array,
            type = typeof first, memberType: CS.System.Type;
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
                        !memberType.IsAssignableFrom(value.GetType())
                    )) {
                        continue;
                    }
                }
                results.SetValue(value, i);
            }
        }
        return results as CS.System.Array$1<T>;
    }
    function toArray<T>(array: CS.System.Array$1<T>): T[];
    function toArray(array: CS.System.Array): any[];
    function toArray() {
        let array: CS.System.Array = arguments[0];
        if (!array)
            return null;
        let results = new Array<any>();
        for (let i = 0; i < array.Length; i++) {
            results.push(array.GetValue(i));
        }
        return results;
    }

    const WatchFlag = Symbol("--watch--");
    const WatchFunctions: typeof Array.prototype = ["pop", "push", "reverse", "shift", "sort", "splice", "unshift"];
    function watch<T>(obj: T, change: () => void) {
        if (!obj || !Array.isArray(obj))
            return obj;
        let functions: { [property: string | symbol]: Function } = {};

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
                        functions[property] = new Proxy(<Function>Array.prototype[property], {
                            apply: function (target, thisArg, argArray) {
                                let result = target.apply(thisArg, argArray);
                                if (WatchFlag in thisArg) {
                                    (<Function>thisArg[WatchFlag])();
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
                    (<Function>target[WatchFlag])();
                }
                return true;
            }
        });
    }
    function unwatch<T>(obj: T) {
        if (typeof (obj) !== "object")
            return;
        delete obj[WatchFlag];
    }

    /**获取IAccessor中的属性
     * @param accessor 
     * @returns 
     */
    export function getAccessorProperties(accessor: AccessorType) {
        let results: { [key: string]: any } = {};

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
    /**将C# IAccessor中的属性绑定到obj对象上
     * @param object 
     * @param accessor 
     * @param bind       运行时绑定
     */
    export function bindAccessor(object: object, accessor: AccessorUnionType, bind?: boolean) {
        if (!accessor)
            return;

        let list: AccessorType[] =
            accessor instanceof CS.System.Array ? toArray(accessor) :
                Array.isArray(accessor) ? accessor : [accessor];
        for (let accessor of list) {
            if (!accessor || accessor.Equals(null))
                continue;
            let properties = getAccessorProperties(accessor),
                keys = Object.keys(properties);
            if (keys.length === 0)
                continue;

            if (isEditor && bind) {
                let set = (key: string, newValue: any) => {
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

    /**以独立组件的方式调用
     * 适用于Update丶LateUpdate和FixedUpdate方法, 默认以BatchProxy管理调用以满足更高性能要求
     * @returns 
     */
    export function standalone(): PropertyDecorator {
        return (target, key: string) => {
            let proto = target.constructor.prototype;
            if (!(proto instanceof TsBehaviourConstructor)) {
                console.warn(`${target.constructor.name}: invaild decorator ${standalone.name}`);
                return;
            }
            Metadata.define(proto, key, standalone);
        };
    }
    /**跨帧调用(全局共用/非单独的frameskip分区)
     * 适用于Update丶LateUpdate和FixedUpdate方法, 仅允许BatchProxy管理调用(与standalone组件冲突)
     * (如你需要处理Input等事件, 那么就不应该使用它)
     * @param value  每n帧调用一次(<不包含>大于1时才有效)
     * @returns 
     */
    export function frameskip(value: number): PropertyDecorator {
        return (target, key: string) => {
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
    /**节流方法
     * 适用于async/Promise方法, 在上一次调用完成后才会再次调用(Awake丶Update丶FixedUpdate...)
     * @param enable 
     * @returns 
     */
    export function throttle(enable: boolean): PropertyDecorator {
        return (target, key: string) => {
            let proto = target.constructor.prototype;
            if (!(proto instanceof TsBehaviourConstructor)) {
                console.warn(`${target.constructor.name}: invaild decorator ${throttle.name}`);
                return;
            }
            Metadata.define(proto, key, throttle, !!enable);
        };
    }
    /**注册侦听器
     * 适用于@see CS.XOR.TsMessages 回调
     * @param eventName 
     * @returns 
     */
    export function listener(eventName?: string): PropertyDecorator {
        return (target, key: string) => {
            let proto = target.constructor.prototype;
            if (!(proto instanceof TsBehaviourConstructor)) {
                console.warn(`${target.constructor.name}: invaild decorator ${listener.name}`);
                return;
            }
            Metadata.define(proto, key, listener, eventName ?? key);
        };
    }
}

/**Update批量调用 */
class BatchProxy {
    private static deltaTime() { return Time.deltaTime; }
    private static fixedDeltaTime() { return Time.fixedDeltaTime; }

    public static get Update() {
        return this._getter("__Update", CS.XOR.UpdateProxy, this.deltaTime)
    };
    public static get FixedUpdate() {
        return this._getter("__FixedUpdate", CS.XOR.FixedUpdateProxy, this.fixedDeltaTime)
    };
    public static get LateUpdate() {
        return this._getter("__LateUpdate", CS.XOR.LateUpdateProxy, this.deltaTime)
    };

    private static _getter(key: string, type: { new(...args: any[]): CS.XOR.ProxyAction }, timeGetter?: () => number) {
        let proxy: BatchProxy = this[key];
        if (!proxy) {
            let gameObject: CS.UnityEngine.GameObject = this["_gameObject_"];
            if (!gameObject || gameObject.Equals(null)) {
                gameObject = new CS.UnityEngine.GameObject("SingletonUpdater");
                gameObject.transform.SetParent((CS.XOR.Application.GetInstance() as CS.XOR.Application).transform);
                this["_gameObject_"] = gameObject;
            }
            proxy = new BatchProxy(gameObject.AddComponent(puerts.$typeof(type)) as any, timeGetter);
            this[key] = proxy;
        }
        return proxy;
    }

    private readonly caller: CS.XOR.ProxyAction;
    private readonly efHanlders: Function[] = [];
    private readonly sfHandlers: Map<number, { tick: number, dt: number, readonly methods: Function[], readonly frameskip: number }> = new Map();

    private constructor(caller: CS.XOR.ProxyAction, timeGetter: () => number) {
        this.caller = caller;
        this.caller.callback = (...args: any[]) => {
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
                if ((--state.tick) > 0) continue;
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
    public addListener(method: Function, frameskip: number = 0) {
        if (frameskip > 1) {
            let state = this.sfHandlers.get(frameskip);
            if (!state) {
                state = { tick: frameskip, dt: 0, methods: [], frameskip };
                this.sfHandlers.set(frameskip, state);
            }
            state.methods.push(method);
        } else {
            this.efHanlders.push(method);
        }
    }
    public removeListener(method: Function, frameskip: number = 0) {
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
function bind(thisArg: object, funcname: string | Function, waitAsyncComplete?: boolean): any {
    const func = typeof (funcname) === "string" ? (thisArg[funcname] as Function) : funcname;
    if (func !== undefined && typeof (func) === "function") {
        //return (...args: any[]) => func.call(thisArg, ...srcArgs, ...args);
        if (waitAsyncComplete) {
            let executing = false;
            return function (...args: any[]) {
                if (executing)
                    return;
                let result = func.call(thisArg, ...args);
                if (result instanceof Promise) {
                    executing = true;       //wait async function finish
                    result.finally(() => executing = false);
                }
                return result;
            };
        }
        return function (...args: any[]) {
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
function call(thisArg: any, func: Function, args?: any[]) {
    try {
        func.apply(thisArg, args);
    }
    catch (e) {
        console.error(e.message + "\n" + e.stack);
    }
}

/**创建C#迭代器 */
function cs_generator(func: ((...args: any[]) => Generator) | Generator, ...args: any[]): CS.System.Collections.IEnumerator {
    let generator: Generator = undefined;
    if (typeof (func) === "function") {
        generator = func(...args);
        if (generator === null || generator === undefined || generator === void 0)
            throw new Error("Function '" + func?.name + "' no return Generator");
    }
    else {
        generator = func;
    }

    return CS.XOR.IEnumeratorUtil.Generator(function () {
        let tick: CS.XOR.IEnumeratorUtil.Tick;
        try {
            let next = generator.next();
            tick = new CS.XOR.IEnumeratorUtil.Tick(next.value, next.done);
        } catch (e) {
            tick = new CS.XOR.IEnumeratorUtil.Tick(null, true);
            console.error(e.message + "\n" + e.stack);
        }
        return tick;
    });
}

const MATEDATA_INFO = Symbol("__MATEDATA_INFO__");
const Metadata = {
    define(proto: object, key: string, attribute: Function, data?: any) {
        let matedatas: { [key: string]: Array<{ attribute: Function, data?: any }> } = proto[MATEDATA_INFO];
        if (!matedatas) {
            matedatas = proto[MATEDATA_INFO] = {};
        }
        let attributes = matedatas[key];
        if (!attributes) {
            attributes = matedatas[key] = [];
        }
        attributes.push({ attribute, data });
    },
    getKeys(proto: object) {
        let matedatas: { [key: string]: Array<{ attribute: Function, data?: any }> } = proto[MATEDATA_INFO];
        return matedatas ? Object.keys(matedatas) : [];
    },
    isDefine(proto: object, key: string, attribute: Function) {
        let matedatas: { [key: string]: Array<{ attribute: Function, data?: any }> } = proto[MATEDATA_INFO];
        if (!matedatas) {
            return false;
        }
        let attributes = matedatas[key];
        if (!attributes) {
            return false;
        }
        return !!attributes.find(define => define.attribute === attribute);
    },
    getDefineData<T = any>(proto: object, key: string, attribute: Function, defaultValue?: T): T {
        let matedatas: { [key: string]: Array<{ attribute: Function, data?: any }> } = proto[MATEDATA_INFO];
        if (!matedatas) {
            return defaultValue;
        }
        let attributes = matedatas[key];
        if (!attributes) {
            return defaultValue;
        }
        return attributes.find(define => define.attribute === attribute)?.data ?? defaultValue;
    }
}

function register() {
    let _g = (global ?? globalThis ?? this);
    _g.xor = _g.xor || {};
    _g.xor.TsBehaviour = TsBehaviourConstructor;
}
register();

/**接口声明 */
declare global {
    namespace xor {
        class TsBehaviour extends TsBehaviourConstructor { }
    }
}
export { };