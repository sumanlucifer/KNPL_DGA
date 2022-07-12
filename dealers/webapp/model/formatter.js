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
            if (mParam === "ACTIVATED")
                return "Success";
            else if (mParam === "DEACTIVATED")
                return "Error";
            else
                return "None";
        },
        RegStatusIcon: function (sRegStatus) {
            switch (sRegStatus) {
                case "PENDING":
                    return "sap-icon://message-warning"
                case "REGISTERED":
                    return "sap-icon://message-success"
            }
        },
        RegStatusColor: function (sRegStatus) {
            switch (sRegStatus) {
                case "PENDING":
                    return sap.ui.core.IconColor.Critical;
                case "REGISTERED":
                    return sap.ui.core.IconColor.Positive;
            }
        },
        fmtStatus: function (mParam) {
            var sLetter = "";
            if (mParam) {
                sLetter = mParam
                    .toLowerCase()
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");
            }
            return sLetter;
        },
       
      
        GetWorkLisPositionId: function (mParam1) {
            if (Array.isArray(mParam1)) {
                var obj;
                var oData = this.getView().getModel();
                if (mParam1.length > 0) {
                    for (var x in mParam1) {
                        obj = oData.getProperty("/" + mParam1[x]);
                        //if (obj["Status"] === "ACTIVATED") {
                        return obj["PositionCode"];
                        //}
                    }
                }

            }
        },
        fmtDisplayDepots: function (mParam1) {
            var aArray = [];
            if (mParam1) {
                if (Array.isArray(mParam1)) {
                    var obj;
                    var oData = this.getView().getModel();
                    for (var x in mParam1) {
                        obj = oData.getProperty("/" + mParam1[x])
                        aArray.push(obj["DepotId"])
                    }
                }

                return aArray.join(" ")
            }

        },


    };
});