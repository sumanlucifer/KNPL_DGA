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
            if(!mParam){
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
        fmtGenerateImageUrl: function (mMetadata) {
            // mMetadata (string) is required from the odata responce "__metadata"
            if (mMetadata) {
                if (mMetadata.media_src) {
                    return "https://".concat(
                        location.host,
                        "/KNPL_PAINTER_API",
                        new URL(mMetadata.media_src).pathname
                    );
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
        }
    };

});