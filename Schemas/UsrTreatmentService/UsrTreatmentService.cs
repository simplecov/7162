namespace Terrasoft.Configuration.UsrTreatmentServiceNamespace
{
    using System;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;
    using Terrasoft.Core;
    using Terrasoft.Web.Common;
    using Terrasoft.Core.Entities;
    using System.Linq;

    [ServiceContract(Namespace = "http://Terrasoft.WebApp.ServiceModel")]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    public class UsrTreatmentService : BaseService
    {


        // Метод, возвращающий идентификатор контакта по его имени.
        [OperationContract]
        [WebInvoke(
            UriTemplate = "GetContactIdByName",
            Method = "POST",
            RequestFormat = WebMessageFormat.Json,
            BodyStyle = WebMessageBodyStyle.Wrapped,
            ResponseFormat = WebMessageFormat.Json)]
        public int GetContactIdByName(string treatmentProgramCode)
        {
            var esq = new EntitySchemaQuery(UserConnection.EntitySchemaManager, "UsrTreatmentSession");
            var countColumn = esq.AddColumn(esq.CreateAggregationFunction(
                Common.AggregationTypeStrict.Sum,
                "UsrDuration"));
            var esqFilter = esq.CreateFilterWithParameters(
                FilterComparisonType.Equal,
                "[UsrTreatmentPrograms:Id:UsrTreatment].UsrCode",
                treatmentProgramCode);

            esq.Filters.Add(esqFilter);

            var entitys = esq.GetEntityCollection(UserConnection);
            if (entitys.Count == 0)
            {
                return -1;
            }

            var count = entitys
                .FirstOrDefault()
                .GetTypedColumnValue<int>(countColumn.Name);

            return count;
        }
    }
}