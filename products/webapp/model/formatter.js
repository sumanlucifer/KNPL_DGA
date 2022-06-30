sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";
    return {
		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
        numberUnit: function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },
        dateFormatter: function (jsonDateString) {
            const dt = DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" });
            var date = new Date(parseInt(jsonDateString.replace('/Date(', '')));
            const dayMonthYear = dt.format(date) // returns: "01/08/2020"
            return dayMonthYear;
        },
        dateFormatter2: function (jsonDateString) {
            const dt = DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy" });
            // var date= new Date(parseInt(jsonDateString.replace('/Date(', '')));
            const dayMonthYear = dt.format(jsonDateString) // returns: "01/08/2020"
            return dayMonthYear;
        },
        status: function (status) {
            if (status) {
                return 'Deactivate ';
            } else {
                return 'Activate';
            }
        },
        statusList: function (status) {
            if (status) {
                return 'Active ';
            } else {
                return 'Inactive';
            }
        },
        langCode: function (code) {
            if (code === "EN") {
                return 'ENGLISH ';
            } else {
                return '';
            }
        },
        fmtDisplayUpdatedDetails: function (mParam1) {
            // mParam1 > createdbydetails/updatedby details
            if (!mParam1) {
                return " "
            }
            if (mParam1) {
                return mParam1["Name"] + " - " + mParam1["Email"];
            }
        },
        positionValueFormatter: function (sValue) {
            if (sValue.length === 0)
                return;
            var oComponentModel = this.getComponentModel();
            var promise = new Promise(function (resolve, reject) {
                oComponentModel.read("/" + sValue[0],
                    {
                        success: function (oData) {
                            resolve(oData.DepotId);
                        },
                        error: function (err) { console.log(err); reject(err); },
                    });
            }.bind(this)); return promise;
        },
    };
});
