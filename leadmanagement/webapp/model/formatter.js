sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        fmtLowerCase: function (mParam) {
            if (!mParam) {
                return
            }
            var sStatus = "";
            if (mParam.split("_").length > 1) {
                var mArray = mParam.split("_");
            } else {
                var mArray = mParam.split(" ");
            }
            for (var x of mArray) {
                var a = x.toLowerCase() + " ";
                var b = a[0].toUpperCase() + a.slice(1);
                sStatus += b;
            }
            return sStatus;
        },

        fmtCheckNull: function (mParam1) {
            if (!mParam1) {
                return "NA"
            }
            return mParam1;
        },

        fnGenerateImageUrl: function (mMetadata) {
            // mMetadata (string) is required from the odata responce "__metadata"
            if (mMetadata) {
                if (mMetadata.media_src) {
                    var sServiceUrl = this.getModel().sServiceUrl;
                    sServiceUrl = sServiceUrl.substring(sServiceUrl.indexOf("/"), sServiceUrl.indexOf("/api")) + new URL(e.media_src).pathname;
                    return "https://".concat(location.host) + sServiceUrl;
                }
            }
            return "";
        },

        fmtStatusColorChange: function (mParam) {
            if (mParam === "APPROVED") {
                return "Success";
            }
            if (mParam === "PUBLISHED") {
                return "Success";
            }
            if (mParam === "PENDING") {
                return "Warning";
            }
            return "Error";
        },

        fmtQuotProducts: function (mParam1) {
            // mParam1 > QuotationSelectedProducts
            if (mParam1) {
                var aProd = []
                var oModel = this.getView().getModel();
                var oObj, oObj2;
                for (var x of mParam1) {
                    oObj = oModel.getProperty("/" + x);
                    oObj2 = oModel.getProperty("/" + oObj["MasterProduct"]["__ref"])
                    aProd.push(oObj2["ProductName"]);
                }
                return aProd.join(" ")
            }
            return ""
        },

        fmtStatusHeader: function (leadeStatusId, IsSamplingRequired, AdvancePaymentCollected, LeadLostReasonId, exp1, exp2, exp3, LeadLostMsg, ShortReasonMsg1, ShortReasonMsg2) {
            if (leadeStatusId === "2") {
                if (IsSamplingRequired === 0 && AdvancePaymentCollected === 0) {

                    var text = "Sampling Required = No, Advance Payment collected=No";
                    return text;
                }
                else if (IsSamplingRequired === 1 && AdvancePaymentCollected === 1) {
                    var text = "Sampling Required = Yes, Advance Payment collected=Yes";
                    return text;
                }
                else if (IsSamplingRequired === 1 || AdvancePaymentCollected === 0) {
                    var text = "Sampling Required = Yes, Advance Payment collected=No";
                    return text;
                }
                else if (IsSamplingRequired === 0 || AdvancePaymentCollected === 1) {
                    var text = "Sampling Required = No, Advance Payment collected=Yes";
                    return text;
                }
                else {
                    return 'NA';
                }
            }
            if (leadeStatusId === "3") {
                if (LeadLostReasonId !== null) {
                    if (LeadLostReasonId === "1") {
                        if (exp1 !== null || exp2 !== null || exp3 !== null) {
                            var text = `${exp1}, ${exp2}, ${exp3}`;
                            return text;
                        } if (LeadLostMsg !== null) {
                            var text = `${LeadLostMsg}`;
                            return text;
                        }
                        else {
                            var text = "NA";
                            return text;
                        }
                    }
                    else {
                        if (exp1 !== null) {
                            var text = `${exp1}`;
                            return text;
                        }
                    }
                }
            }
            if (leadeStatusId === "4") {
                if (ShortReasonMsg2 !== null) {
                    var text = `${ShortReasonMsg2}`
                    return text;
                }
                if (ShortReasonMsg1 !== null) {
                    var text = `${ShortReasonMsg1}`
                    return text;
                }
            }
            return text;
        },

        fmtCommaSepratedAssignedContractor: function (mParam) {
            if (mParam === null)
                return "";
            var contractorArray = [];
            for (var i in mParam) {
                var contractorKey = mParam[i];
                var contractorObject = this.getView().getModel().getProperty("/" + contractorKey);
                if (contractorObject.IsActive) {
                    if (contractorObject.ContractorId) {
                        if (contractorObject.Contractor) {
                            var contractorDetails = this.getView().getModel().getProperty("/" + contractorObject.Contractor.__ref);
                            contractorArray.push(contractorDetails.Name);
                        }
                    }
                    else
                        contractorArray.push(contractorObject.ContractorName);
                }
            }
            if (contractorArray.length)
                var commaSeparatedString = contractorArray.join(", ");
            else
                commaSeparatedString = 'NA';
            return commaSeparatedString;
        },

        handleNoData: function (sValue) {
            if (!sValue) {
                var sNoData = "NA";
                return sNoData;
            } else {
                return sValue;
            }
        }
    };
});