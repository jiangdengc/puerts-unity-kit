import * as csharp from "csharp";
import { $typeof } from "puerts";

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
function field(): PropertyDecorator {
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
        function field(): PropertyDecorator;
    }
}