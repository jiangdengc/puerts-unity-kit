using System;
using UnityEngine;

namespace XOR
{
    internal static class Skin
    {
        public const float LineSpace = 5f;
        public const float RowSpace = 2f;

        public static readonly Accessor<GUIStyle> headerBox = new Accessor<GUIStyle>(() =>
        {
            GUIStyle style = new GUIStyle("HeaderButton");
            style.alignment = TextAnchor.MiddleLeft;
            return style;
        });
        public static readonly Accessor<GUIStyle> groupBox = new Accessor<GUIStyle>(() =>
        {
            GUIStyle style = new GUIStyle("GroupBox");
            style.padding = new RectOffset()
            {
                left = 5
            };
            style.margin = new RectOffset();
            return style;
        });
        public static readonly Accessor<GUIStyle> label = new Accessor<GUIStyle>(() =>
        {
            GUIStyle style = new GUIStyle(GUI.skin.label);
            style.alignment = TextAnchor.MiddleLeft;
            style.richText = true;
            return style;
        });
        public static readonly Accessor<GUIStyle> labelBold = new Accessor<GUIStyle>(() =>
        {
            GUIStyle style = new GUIStyle(GUI.skin.label);
            style.alignment = TextAnchor.MiddleLeft;
            style.richText = true;
            style.fontStyle = FontStyle.Bold;
            return style;
        });

        public static readonly Accessor<GUIStyle> labelGreen = new Accessor<GUIStyle>(() =>
        {
            GUIStyle style = new GUIStyle(GUI.skin.label);
            style.alignment = TextAnchor.MiddleCenter;
            style.richText = true;
            style.fontStyle = FontStyle.Bold;
            style.normal.textColor = Color.green;
            style.hover = style.focused = style.active =
            style.onNormal = style.onHover = style.onActive = style.onFocused = style.normal;
            return style;
        });
        public static readonly Accessor<GUIStyle> labelYellow = new Accessor<GUIStyle>(() =>
        {
            GUIStyle style = new GUIStyle(GUI.skin.label);
            style.alignment = TextAnchor.MiddleCenter;
            style.richText = true;
            style.fontStyle = FontStyle.Bold;
            style.normal.textColor = Color.yellow;
            style.hover = style.focused = style.active =
            style.onNormal = style.onHover = style.onActive = style.onFocused = style.normal;
            return style;
        });
        public static readonly Accessor<GUIStyle> labelGray = new Accessor<GUIStyle>(() =>
        {
            GUIStyle style = new GUIStyle(GUI.skin.label);
            style.alignment = TextAnchor.MiddleCenter;
            style.richText = true;
            style.fontStyle = FontStyle.Bold;
            style.normal.textColor = Color.gray;
            style.hover = style.focused = style.active =
            style.onNormal = style.onHover = style.onActive = style.onFocused = style.normal;
            return style;
        });


        public static readonly Accessor<GUIStyle> ErrorIcon = new Accessor<GUIStyle>(() =>
        {
            //Wizard Error
            return null;
        });

        /// <summary>红色圆 </summary>
        public static readonly Accessor<GUIStyle> WinBtnCloseMac = new Accessor<GUIStyle>(() =>
        {
            return "WinBtnCloseMac";
        });
        /// <summary>灰色圆 </summary>
        public static readonly Accessor<GUIStyle> WinBtnInactiveMac = new Accessor<GUIStyle>(() =>
        {
            return "WinBtnInactiveMac";
        });
        /// <summary>绿色圆 </summary>
        public static readonly Accessor<GUIStyle> WinBtnMaxMac = new Accessor<GUIStyle>(() =>
        {
            return "WinBtnMaxMac";
        });
        /// <summary>黄色圆 </summary>
        public static readonly Accessor<GUIStyle> WinBtnMinMac = new Accessor<GUIStyle>(() =>
        {
            return "WinBtnMinMac";
        });


        public class Accessor<T>
            where T : new()
        {
            private T _value;
            private Func<T> _creator;

            public Accessor(Func<T> creator)
            {
                this._creator = creator;
            }

            public T GetValue()
            {
                if (this._value == null)
                {
                    this._value = this._creator();
                }
                return this._value;
            }

            public static implicit operator T(Accessor<T> v)
            {
                if (v == null)
                    return default;
                return v.GetValue();
            }
        }
    }
}