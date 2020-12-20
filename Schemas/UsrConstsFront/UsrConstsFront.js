define("UsrConstsFront", [],
	function() {
		
		function GetEmployeeId(){
			// Contact type lookup
			const employee = "60733EFC-F36B-1410-A883-16D83CAB0980";
			return employee.toLowerCase();
		}
		
		function GetDailyProgramTypeId(){
			// Treatment frequency type lookup
			const frequencyType = "BC566AE2-E8CF-4580-882E-9D0E501F9438";
			return frequencyType.toLowerCase();
		}

		return {
			GetEmployeeId: GetEmployeeId,
			GetDailyProgramTypeId: GetDailyProgramTypeId,
		};
});
