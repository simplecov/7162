define(
	"UsrTreatmentSessionDetail",
	["ConfigurationGrid", "ConfigurationGridGenerator", "ConfigurationGridUtilities"],
	function() {
	return {
		entitySchemaName: "UsrTreatmentSession",
		attributes: {
		// Признак возможности редактирования.
			"IsEditable": {
				// Тип данных — логический.
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				// Тип атрибута — виртуальная колонка модели представления.
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				// Устанавливаемое значение.
				value: true
			}
		},
		// Используемые миксины.
		mixins: {
			ConfigurationGridUtilities: "Terrasoft.ConfigurationGridUtilities"
		},
		details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
		{
			// Тип операции — слияние.
			"operation": "merge",
			// Название элемента схемы, над которым производится действие.
			"name": "DataGrid",
			// Объект, свойства которого будут объединены со свойствами элемента схемы.
			"values": {
				// Имя класса
				"className": "Terrasoft.ConfigurationGrid",
				// Генератор представления должен генерировать только часть представления.
				"generator": "ConfigurationGridGenerator.generatePartial",
				// Привязка события получения конфигурации элементов редактирования
				// активной строки к методу-обработчику.
				"generateControlsConfig": {"bindTo": "generateActiveRowControlsConfig"},
				// Привязка события смены активной записи к методу-обработчику.
				"changeRow": {"bindTo": "changeRow"},
				// Привязка события отмены выбора записи к методу-обработчику.
				"unSelectRow": {"bindTo": "unSelectRow"},
				// Привязка  события клика на реестре к методу-обработчику.
				"onGridClick": {"bindTo": "onGridClick"},
				// Действия, производимые с активной записью.
				"activeRowActions": [
					// Настройка действия [Сохранить].
					{
						// Имя класса элемента управления, с которым связано действие.
						"className": "Terrasoft.Button",
						// Стиль отображения — прозрачная кнопка.
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						// Тег.
						"tag": "save",
						// Значение маркера.
						"markerValue": "save",
						// Привязка к изображению кнопки.
						"imageConfig": {"bindTo": "Resources.Images.SaveIcon"}
					},
					// Настройка действия [Отменить].
					{
						"className": "Terrasoft.Button",
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "cancel",
						"markerValue": "cancel",
						"imageConfig": {"bindTo": "Resources.Images.CancelIcon"}
					},
					// Настройка действия [Удалить].
					{
						"className": "Terrasoft.Button",
						"style": this.Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
						"tag": "remove",
						"markerValue": "remove",
						"imageConfig": {"bindTo": "Resources.Images.RemoveIcon"}
					}
				],
				// Привязка к методу, который инициализирует подписку на события
				// нажатия кнопок в активной строке.
				"initActiveRowKeyMap": {"bindTo": "initActiveRowKeyMap"},
				// Привязка события выполнения действия активной записи к методу-обработчику.
				"activeRowAction": {"bindTo": "onActiveRowAction"},
				// Признак возможности выбора нескольких записей.
				"multiSelect": {"bindTo": "MultiSelect"}
			}
		}
		]/**SCHEMA_DIFF*/,
		methods: {
			validateSessionAmount: function(callback, scope) {
				let schemaName = "UsrTreatmentSession";
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: schemaName
				});
				esq.addAggregationSchemaColumn(
					"Count",
					Terrasoft.AggregationType.COUNT,
					"Id",
					Terrasoft.AggregationEvalType.DISTINCT);
				let filter = esq.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					"UsrTreatment",
					this.$PrimaryColumnValue);
				esq.filters.add("byTreatmentId", filter);
				esq.getEntityCollection(function (result) {
					let asd = result;
					if (!result.success) {
						// обработка/логирование ошибки, например
						this.showInformationDialog("Ошибка запроса данных");
						return;
					}
					// result.collection.each(function (item) {
					// 	message += "Account name: " + item.get("AccountName") +
					// 	" - primary contact name: " + item.get("PrimaryContactName") + "\n";
					// });
					// this.showInformationDialog(message);
				}, this);
				let result = {success: false, message: "asdasdasd"};
				callback.call(scope, result);
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
		}
	};
});
