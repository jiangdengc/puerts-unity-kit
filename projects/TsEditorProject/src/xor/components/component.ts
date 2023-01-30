import * as csharp from "csharp";
import { $typeof } from "puerts";


type NumberConstructor = {
    new(): csharp.System.Byte;
    new(): csharp.System.SByte;
    new(): csharp.System.Char;
    new(): csharp.System.Int16;
    new(): csharp.System.UInt16;
    new(): csharp.System.Int32;
    new(): csharp.System.UInt32;
    new(): csharp.System.Int64;
    new(): csharp.System.UInt64;
};
type FieldOptions = NumberConstructor | Partial<{
    /**指定RawType(原始类型: System.Int16/System.Int32等类型都对应number) */
    type: NumberConstructor;
    /**指定数值范围 */
    range: [min: number, max: number],
}>;

class TsComponentConstructor extends xor.TsBehaviour {

}
function guid(guid: number | string): ClassDecorator {
    return (target) => {

    };
}
function route(path: string): ClassDecorator {
    return (target) => {

    };
}
function field(options?: FieldOptions): PropertyDecorator {
    return (target, key) => {
    };
}

function register() {
    let _g = (global ?? globalThis ?? this);
    _g.xor = _g.xor || {};
    _g.xor.TsComponent = TsComponentConstructor;
    _g.xor.guid = guid;
    _g.xor.route = route;
    _g.xor.field = field;
}
register();

/**接口声明 */
declare global {
    namespace xor {
        class TsComponent extends TsComponentConstructor { }
        /**定义组件guid(全局唯一性)
         * @param guid 
         * @example
         * ```
         * //⚠⚠⚠警告: 此语句由xor自动生成并与class/enum声明绑定, 用户不应该手动创建丶修改丶移动或删除
         * \@xor.guid('global uniqure identifier')
         * export class Example extends xor.TsComponent{
         *      //......
         * }
         * ```
         */
        function guid(guid: number | string): ClassDecorator;
        /**定义组件别名(后续可由此名称Get/Add TsComponent)
         * @param path 
         * @example
         * ```
         * //⚠⚠⚠警告: 此语句由xor自动生成并与class/enum声明绑定, 用户不应该手动创建丶修改丶移动或删除
         * \@xor.route('global unique arbitrary string')
         * export class Example extends xor.TsComponent{
         *      //......
         * }
         * ```
         */
        function route(path: string): ClassDecorator;
        /**定义序列化字段
         * @param options 
         */
        function field(options?: FieldOptions): PropertyDecorator;
    }
}