import * as csharp from "csharp";
import Transform = csharp.UnityEngine.Transform;
import GameObject = csharp.UnityEngine.GameObject;
import RectTransform = csharp.UnityEngine.RectTransform;
import PointerEventData = csharp.UnityEngine.EventSystems.PointerEventData;
import Collision = csharp.UnityEngine.Collision;
import Collision2D = csharp.UnityEngine.Collision2D;
import Collider = csharp.UnityEngine.Collider;
import Collider2D = csharp.UnityEngine.Collider2D;
/**
 * 详情参阅: https://docs.unity3d.com/cn/current/ScriptReference/MonoBehaviour.html
 */
declare abstract class IBehaviour {
    /**
     * 创建实例时被调用
     */
    protected onConstructor?(): void;
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
declare abstract class IGizmos {
    /**
     * (仅Editor可用)
     * Gizmos 类允许您将线条、球体、立方体、图标、纹理和网格绘制到 Scene 视图中，在开发项目时用作调试、设置的辅助手段或工具。
     * Handles 类似于 Gizmos，但在交互性和操作方面提供了更多功能。Unity 本身提供的用于在 Scene 视图中操作项目的 3D 控件是 Gizmos 和 Handles 的组合。内置的 Handle GUI 有很多，如通过变换组件定位、缩放和旋转对象等熟悉的工具。不过，您可以自行定义 Handle GUI，以与自定义组件编辑器结合使用。此类 GUI 对于编辑以程序方式生成的场景内容、“不可见”项和相关对象的组（如路径点和位置标记）非常实用。
     */
    protected OnDrawGizmosSelected?(): void;
    /**(仅Editor可用)*/
    protected OnSceneGUI?(): void;
}
declare abstract class IOnPointerHandler {
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerClickHandler
     * @see csharp.UnityEngine.EventSystems.IPointerClickHandler
     * @param eventData
     */
    protected OnPointerClick?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerDownHandler
     * @see csharp.UnityEngine.EventSystems.IPointerDownHandler
     * @param eventData
     */
    protected OnPointerDown?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerUpHandler
     * @see csharp.UnityEngine.EventSystems.IPointerUpHandler
     * @param eventData
     */
    protected OnPointerUp?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerEnterHandler
     * @see csharp.UnityEngine.EventSystems.IPointerEnterHandler
     * @param eventData
     */
    protected OnPointerEnter?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IPointerExitHandler
     * @see csharp.UnityEngine.EventSystems.IPointerExitHandler
     * @param eventData
     */
    protected OnPointerExit?(eventData: PointerEventData): void;
}
declare abstract class IOnDragHandler {
    /**
     * 实现C#接口: UnityEngine.EventSystems.IBeginDragHandler
     * @see csharp.UnityEngine.EventSystems.IBeginDragHandler
     * @param eventData
     */
    protected OnBeginDrag?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IDragHandler
     * @see csharp.UnityEngine.EventSystems.IDragHandler
     * @param eventData
     */
    protected OnDrag?(eventData: PointerEventData): void;
    /**
     * 实现C#接口: UnityEngine.EventSystems.IEndDragHandler
     * @see csharp.UnityEngine.EventSystems.IEndDragHandler
     * @param eventData
     */
    protected OnEndDrag?(eventData: PointerEventData): void;
}
declare abstract class IOnCollision {
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
declare abstract class IOnCollision2D {
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
declare abstract class IOnTrigger {
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
declare abstract class IOnTrigger2D {
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
declare abstract class IOnMouse {
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
 * @see Standalone 如果需要绑定独立的组件, 在对应方法上添加此标注
 */
declare class TsBehaviourConstructor {
    private __transform__;
    private __gameObject__;
    private __component__;
    private __listeners__;
    private __listenerProxy__;
    constructor(trf: Transform | GameObject, refs?: boolean | csharp.XOR.TsProperties | csharp.XOR.TsProperties[]);
    StartCoroutine(routine: ((...args: any[]) => Generator) | Generator, ...args: any[]): csharp.UnityEngine.Coroutine;
    StopCoroutine(routine: csharp.UnityEngine.Coroutine): void;
    StopAllCoroutines(): void;
    /**添加Unity Message listener
     * @param eventName
     * @param fn
     */
    protected addListener(eventName: string, fn: Function): void;
    /**移除Unity Message listener
     * @param eventName
     * @param fn
     */
    protected removeListener(eventName: string, fn: Function): void;
    /**移除所有Unity Message listener
     * @param eventName
     */
    protected removeAllListeners(eventName: string): void;
    /**清空Unity Message listener */
    protected clearListeners(): void;
    private _invokeListeners;
    protected disponse(): void;
    private _bindProxies;
    private _bindUpdateProxies;
    private _bindListeners;
    private _bindModuleForEditor;
    get transform(): Transform;
    get gameObject(): GameObject;
    get enabled(): boolean;
    set enabled(value: boolean);
    get isActiveAndEnabled(): boolean;
    get tag(): string;
    set tag(value: string);
    get name(): string;
    set name(value: string);
    get rectTransform(): RectTransform;
    protected get component(): csharp.XOR.TsBehaviour;
}
interface TsBehaviourConstructor extends IBehaviour, IGizmos, IOnPointerHandler, IOnDragHandler, IOnMouse, IOnCollision, IOnCollision2D, IOnTrigger, IOnTrigger2D {
}
declare namespace TsBehaviourConstructor {
    /**将C# TsPropertys中的属性绑定到obj对象上
     * @param instance
     * @param refs
     * @param destroy
     */
    function bindPropertys(instance: object, refs: csharp.XOR.TsProperties | csharp.XOR.TsProperties[] | csharp.System.Array$1<csharp.XOR.TsProperties>, destroy?: boolean): void;
    /**以独立组件的方式调用
     * 适用于Update丶LateUpdate和FixedUpdate方法, 默认以BatchProxy管理调用以满足更高性能要求
     * @returns
     */
    function Standalone(): PropertyDecorator;
    /**跨帧调用(全局共用/非单独的frameskip分区)
     * 适用于Update丶LateUpdate和FixedUpdate方法, 仅允许BatchProxy管理调用(与Standalone组件冲突)
     * @param value  每n帧调用一次(<不包含>大于1时才有效)
     * @returns
     */
    function Frameskip(value: number): PropertyDecorator;
    /**节流方法
     * 适用于async/Promise方法, 在上一次调用完成后才会再次调用(Awake丶Update丶FixedUpdate...)
     * @param enable
     * @returns
     */
    function Throttle(enable: boolean): PropertyDecorator;
    /**注册侦听器
     * 适用于@see csharp.XOR.TsMessages 回调
     * @param eventName
     * @returns
     */
    function Listener(eventName?: string): PropertyDecorator;
}
/**接口声明 */
declare global {
    namespace xor {
        class TsBehaviour extends TsBehaviourConstructor {
        }
    }
}
export {};
