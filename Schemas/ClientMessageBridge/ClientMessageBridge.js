define("ClientMessageBridge", [], function() {
	return {
		messages: {
			"BusinessProcessCompletedReloadForm": {
				mode: Terrasoft.MessageMode.BROADCAST,
				direction: Terrasoft.MessageDirectionType.PUBLISH
			}
		},
		methods: {
			init: function() {
				this.callParent(arguments);
				this.addMessageConfig({
					sender: "BusinessProcessCompletedReloadForm",
					messageName: "BusinessProcessCompletedReloadForm"
				});
			}
		}
	};
});