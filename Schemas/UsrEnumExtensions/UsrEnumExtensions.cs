namespace Terrasoft.Configuration.UsrEnumExtensionsNamespace
{
    using System;
    using System.Linq;

    public class UidAttribute : Attribute
    {
        public string Id { get; private set; }
        internal UidAttribute(string id)
        {
            this.Id = id;
        }
    }

    public static class EnumExtensions
    {
        public static TAttribute GetAttribute<TAttribute>(this Enum value)
            where TAttribute : Attribute
        {
            var type = value.GetType();
            var name = Enum.GetName(type, value);
            return type.GetField(name)
                .GetCustomAttributes(false)
                .OfType<TAttribute>()
                .SingleOrDefault();
        }
    }
}