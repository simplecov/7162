namespace Terrasoft.Configuration.UsrTreatmentManagerNamespace
{
    using System;
    using System.ServiceModel;
    using System.ServiceModel.Web;
    using System.ServiceModel.Activation;
    using Terrasoft.Core;
    using Terrasoft.Web.Common;
    using Terrasoft.Core.Entities;
    using System.Linq;
    using System.Collections.Generic;
    using Terrasoft.Configuration.UsrEnumExtensionsNamespace;
    using SystemSettings = Terrasoft.Core.Configuration.SysSettings;

    public class UsrTreatmentManager
    {
        private UserConnection _userConnection;
        private List<UsrTreatmentSession> _sessionList;
        private List<EUsrTreatmentFrequencyType> _treatmentCourse;

        private Guid _frequencyTypeId;
        private EUsrTreatmentFrequencyType _frequencyType;

        private int _createdRecodsQuantity;

        public UsrTreatmentManager(UserConnection userConnection)
        {
            _userConnection = userConnection;
        }

        public void SetTreatmentFrequenceType( Guid id )
        {
            var treatment = new UsrTreatmentPrograms(_userConnection);
            treatment.FetchFromDB(id);
            //_frequencyTypeId = treatment.UsrTreatmentFrequencyId;
            var frequencyTypes = EUsrTreatmentFrequencyType
                .GetValues(typeof(EUsrTreatmentFrequencyType))
                .Cast<EUsrTreatmentFrequencyType>()
                .ToList();
            frequencyTypes.ForEach(type => 
            {
                var attr = type.GetAttribute<UidAttribute>();
                var typeId = Guid.Parse(attr.Id);
                if(typeId == treatment.UsrTreatmentFrequencyId)
                {
                    _frequencyType = type;
                }
            });
        }

        public void CreateTreatmentSessionRecords( Guid treatmentId )
        {
            SetDefaultTreatmentSessionRecordsQuantity();

            var date = DateTime.Now;

            _treatmentCourse.ForEach(frType =>
            {
                var session = CreateTreatmentSession(frType);
                _sessionList.Add(session);
            });
            _sessionList = new List<UsrTreatmentSession>(_createdRecodsQuantity);
        }

        private UsrTreatmentSession CreateTreatmentSession(EUsrTreatmentFrequencyType frequencyType)
        {
            
            var lastSessionIndex = _sessionList.Count > 0
                ? _sessionList.Count - 1
                : -1;

            var session = new UsrTreatmentSession(_userConnection);
            session.SetDefColumnValues();
            //session.Trea
            if (lastSessionIndex >= 0)
            {
                session.UsrDate = DateTime.Today;
            }

            var dateTime = new DateTime();
            var lastSession = _sessionList[_sessionList.Count - 1];

            return session;
        }

        private DateTime GetSessionStartDate()
        {
            return new DateTime();
        }

        private void SetDefaultTreatmentSessionRecordsQuantity()
        {
            _createdRecodsQuantity = SystemSettings.GetValue(_userConnection, "UsrTreatmentSessionСreatedRecordsQuantity", 0);
        }

        public enum EUsrTreatmentFrequencyType
        {
            [Uid("BC566AE2-E8CF-4580-882E-9D0E501F9438")]
            Daily,

            [Uid("0530B6CD-855F-4080-8A66-F4C39749BD9A")]
            Weekly,

            [Uid("F34661E3-1191-48EB-A889-F46FF6B52153")]
            Monthly
        }
    }
}