define("UsrTreatmentPrograms1Page",
["UsrConstsFront", "ProcessModuleUtilities"],
function(UsrConstsFront, ProcessModuleUtilities) {
	return {
		entitySchemaName: "UsrTreatmentPrograms",
		messages: {
			"BusinessProcessCompletedReloadForm": {
				mode: this.Terrasoft.MessageMode.BROADCAST,
				direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		attributes: {
			"UsrResponsible": {
				lookupListConfig: {
					filters: [
						function() {
							let filters = Ext.create("Terrasoft.FilterGroup");
							let employeeTypeId = UsrConstsFront.GetEmployeeId();
							let filter = Terrasoft.createColumnFilterWithParameter(
								Terrasoft.ComparisonType.EQUAL,
								"Type",
								employeeTypeId);
							filters.add("OnlyEmployee", filter);
							return filters;
						}
					]
				}
			},
			"UsrTreatmentFrequency": {
				dependencies: [
					{
						columns: ["UsrTreatmentFrequency"],
						methodName: "setUsrTreatmentFrequencyDependentValues"
					}
				]
			},
			"UsrInitiallyDailyProgram": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				caption: "Daily programs quantity",
			},
			"UsrTreatmentFrequencyIsChanged": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				caption: "Frequency type is changed",
				value: false
			},
		},
		modules: /**SCHEMA_MODULES*/{}/**SCHEMA_MODULES*/,
		details: /**SCHEMA_DETAILS*/{
			"Files": {
				"schemaName": "FileDetailV2",
				"entitySchemaName": "UsrTreatmentProgramsFile",
				"filter": {
					"masterColumn": "Id",
					"detailColumn": "UsrTreatmentPrograms"
				}
			},
			"UsrTreatmentSessionDetailc0a25868": {
				"schemaName": "UsrTreatmentSessionDetail",
				"entitySchemaName": "UsrTreatmentSession",
				"filter": {
					"detailColumn": "UsrTreatment",
					"masterColumn": "Id"
				}
			}
		}/**SCHEMA_DETAILS*/,
		businessRules: /**SCHEMA_BUSINESS_RULES*/{}/**SCHEMA_BUSINESS_RULES*/,
		methods: {
			onEntityInitialized: function() {
				this.callParent(arguments);
				this.setIsInitiallyDailyProgram();
			},
			onBusinessProcessCompletedReloadForm: function(args) {
				this.updateDetail({detail: "UsrTreatmentSessionDetailc0a25868"});
			},
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("BusinessProcessCompletedReloadForm", this.onBusinessProcessCompletedReloadForm,
					this);
			},
			validateSessionAmount: function(callback, scope) {
				
				let validationResult = {
					success: false,
					message: "Может быть только 3 (три) ежедневных программы лечения"
				};
				
				let isActive = this.get("UsrIsActive");
				if(!isActive) {
					validationResult.success = true;
					callback.call(scope, validationResult);
					return;
				}
				
				let dailyFrequencyType = UsrConstsFront.GetDailyProgramTypeId();
				let currentFrequencyType = this.getLookupValue("UsrTreatmentFrequency");
				let frequencyTypesIsMatch = dailyFrequencyType === currentFrequencyType;
				if(!frequencyTypesIsMatch) {
					validationResult.success = true;
					callback.call(scope, validationResult);
					return;
				}
				
				let initiallyDailyProgram = this.get("UsrInitiallyDailyProgram");
				let treatmentFrequencyIsChanged = this.get("UsrTreatmentFrequencyIsChanged");
				if(initiallyDailyProgram && !treatmentFrequencyIsChanged) {
					validationResult.success = true;
					callback.call(scope, validationResult);
					return;
				}
				
				let esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: this.entitySchemaName
				});
				esq.addAggregationSchemaColumn(
					"Id",
					Terrasoft.AggregationType.COUNT,
					"Count",
					Terrasoft.AggregationEvalType.DISTINCT);
				esq.filters.add("ByTreatmentFrequency", esq.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"UsrTreatmentFrequency",
					dailyFrequencyType));
				esq.filters.add("IsActive", esq.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"UsrIsActive",
					true));
				esq.getEntityCollection(function (result) {
					
					if (!result.success) {
						this.showInformationDialog("Ошибка запроса данных при установке значения Daily programs quantity");
						return;
					}
					let responseItem = result.collection.getItems()[0];
					let count = responseItem.$Count;
					
					let sysDaylyProgramsCount = Terrasoft.SysSettings.getCachedSysSetting("UsrMaxDayliProgramsQuantity");
					let isAllowed = count < sysDaylyProgramsCount;
					
					validationResult.success = isAllowed;
					callback.call(scope, validationResult);
				}, this);
			},
			asyncValidate: function(callback, scope) {
				this.callParent([function(response) {
					if (!this.validateResponse(response)) {
						return;
					}
					Terrasoft.chain(
						function(next) {
							this.validateSessionAmount(function(response) {
								if (this.validateResponse(response)) {
									next();
								}
							}, this);
						},
						function(next) {
							callback.call(scope, response);
							next();
						}, this);
				}, this]);
			},
			setIsInitiallyDailyProgram() {
				let dailyFrequencyType = UsrConstsFront.GetDailyProgramTypeId();
				let currentFrequency = this.getLookupValue("UsrTreatmentFrequency");
				let isDailyProgram = currentFrequency === dailyFrequencyType;
				let isActive = this.get("UsrIsActive");
				this.set("UsrInitiallyDailyProgram", isDailyProgram && !this.isNew && isActive);
			},
			setUsrTreatmentFrequencyDependentValues() {
				this.set("UsrTreatmentFrequencyIsChanged", true);
			},
			fillSessionDetail: function() {
				this.FillSessions();
				this.showInformationDialog("Сеансы заполнены");
			},
			getActions: function() {
				// Вызывается родительская реализация метода для получения
				// коллекции проинициализированных действий базовой страницы.
				var actionMenuItems = this.callParent(arguments);
				// Добавление линии-разделителя.
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				// Добавление пункта меню в список действий страницы редактирования.
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Caption": {bindTo: "Resources.Strings.CreateSessionRecords"},
					// Привязка метода-обработчика действия.
					"Tag": "fillSessionDetail",
					"Enabled": true
				}));
				return actionMenuItems;
			},
			FillSessions: function(processName) {
				var treatmentId = this.$PrimaryColumnValue;
				var args = {
					sysProcessName: "UsrFillTreatmentSessionDetail",
					parameters: {
						UsrTreatmentId: treatmentId
					}
				};
				ProcessModuleUtilities.executeProcess(args);
			}
		},
		dataModels: /**SCHEMA_DATA_MODELS*/{}/**SCHEMA_DATA_MODELS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"name": "UsrName12cb8ed9-49d3-419e-8d5b-96e9e89c9f99",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrName"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrIsActivee6f1bd4a-4027-44d5-b7b5-919dd21746d4",
				"values": {
					"layout": {
						"colSpan": 24,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "ProfileContainer"
					},
					"bindTo": "UsrIsActive"
				},
				"parentName": "ProfileContainer",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "UsrResponsible4118c953-6582-40e0-9aef-591fb1d43602",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 0,
						"layoutName": "Header"
					},
					"bindTo": "UsrResponsible"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrTreatmentFrequencye4410d4b-8fc8-4928-bfd9-324673b3465b",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 1,
						"layoutName": "Header"
					},
					"bindTo": "UsrTreatmentFrequency"
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "STRINGba2be871-0b90-4842-9e43-b9663bad427c",
				"values": {
					"layout": {
						"colSpan": 12,
						"rowSpan": 1,
						"column": 0,
						"row": 2,
						"layoutName": "Header"
					},
					"bindTo": "UsrComment",
					"enabled": true,
					"contentType": 0
				},
				"parentName": "Header",
				"propertyName": "items",
				"index": 2
			},
			{
				"operation": "insert",
				"name": "Tab408bc1beTabLabel",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.Tab408bc1beTabLabelTabCaption"
					},
					"items": [],
					"order": 0
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "UsrTreatmentSessionDetailc0a25868",
				"values": {
					"itemType": 2,
					"markerValue": "added-detail"
				},
				"parentName": "Tab408bc1beTabLabel",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "NotesAndFilesTab",
				"values": {
					"caption": {
						"bindTo": "Resources.Strings.NotesAndFilesTabCaption"
					},
					"items": [],
					"order": 1
				},
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Files",
				"values": {
					"itemType": 2
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "insert",
				"name": "NotesControlGroup",
				"values": {
					"itemType": 15,
					"caption": {
						"bindTo": "Resources.Strings.NotesGroupCaption"
					},
					"items": []
				},
				"parentName": "NotesAndFilesTab",
				"propertyName": "items",
				"index": 1
			},
			{
				"operation": "insert",
				"name": "Notes",
				"values": {
					"bindTo": "UsrNotes",
					"dataValueType": 1,
					"contentType": 4,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 24
					},
					"labelConfig": {
						"visible": false
					},
					"controlConfig": {
						"imageLoaded": {
							"bindTo": "insertImagesToNotes"
						},
						"images": {
							"bindTo": "NotesImagesCollection"
						}
					}
				},
				"parentName": "NotesControlGroup",
				"propertyName": "items",
				"index": 0
			},
			{
				"operation": "merge",
				"name": "ESNTab",
				"values": {
					"order": 2
				}
			}
		]/**SCHEMA_DIFF*/
	};
});
