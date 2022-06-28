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
                if (mMetadata.hasOwnProperty("media_src")) {
                    if (mMetadata.media_src) {
                        return "https://".concat(
                            location.host,
                            "/KNPL_DGA_API",
                            new URL(mMetadata.media_src).pathname
                        );
                    }
                }

            }

            return "";

        },
        fmtStatusColorChange: function (mParam) {
            if (mParam === "ACTIVATED") {
                return "Success";
            }
            if (mParam === "PUBLISHED") {
                return "Success";
            }
            if (mParam === "PENDING") {
                return "Warning";
            }
            if (mParam === "DEACTIVATED") {
                return "Error";
            }
            return "None";
        },
        fmtStatusColorChange2: function (mParam) {
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
        fmtEnbChangeStatus: function (mParam1, mParam2) {
            /*
            * mparam1 = activation status
            * mParam2 = IsReplaced
            */
            if (mParam1 === 'DEACTIVATED') {
                if (mParam2 === true) {
                    return false;
                }
            }
            return true
        },
        fmtChildTowns: function (mParam1) {

            var aArray = []
            if (mParam1) {
                for (var x of mParam1) {
                    aArray.push(x["TownName"] + " - " + x["TownId"])
                }
            }

            return aArray.join(", ")

        },

        fmtDealerValueHelp1: function (mParam1, mParam2) {
            if (mParam1) {
                return this._geti18nText("Message22") + mParam1;
            }
            if (mParam2) {
                return this._geti18nText("Message22") + mParam2;
            }
        },
        GetWorkLisPositionId: function (mParam1) {

            if (Array.isArray(mParam1)) {
                var obj;
                var oData = this.getView().getModel();
                if (mParam1.length > 0) {
                    for (var x in mParam1) {
                        obj = oData.getProperty("/" + mParam1[x]);
                        if (obj["Status"] === "ACTIVATED") {
                            return obj["PositionCode"];
                        }
                    }
                }

            }
        },
        fmtDisplayReplacedBtn: function (mParam1, mParam2) {
            /**
             * mParam1 - activation status
             * mParam2 - IsReplaced
            */
           console.log(mParam1,mParam2)
            if (mParam1 === "DEACTIVATED") {
                if (mParam2 === true) {
                    return false;
                }
            }
            return true
        },
        GetWorkListDepot: function (mParam1) {
            var aArray = [];
            if (Array.isArray(mParam1)) {
                var obj;
                var oData = this.getView().getModel();
                if (mParam1.length > 0) {
                    for (var x in mParam1) {
                        obj = oData.getProperty("/" + mParam1[x])["DepotId"];
                        aArray.push(obj)
                    }
                }
                return aArray.join(" ")
            }
        },
        GetWorkListDepot2: function (mParam1) {
            // used in the worklist view
            var aArray = [];
            if (Array.isArray(mParam1)) {
                var obj,obj2;
                var oData = this.getView().getModel();
                if (mParam1.length > 0) {
                    for (var x in mParam1) {
                        obj = oData.getProperty("/" + mParam1[x]);
                        obj2=oData.getProperty("/"+obj["Depot"]["__ref"])
                        aArray.push(""+obj2["Depot"]+" - "+""+obj2["Id"]+"")
                    }
                }
                return aArray.join(" ")
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
        fmtChildTowns2: function (mParam1) {

            var aArray = []
            if (mParam1) {
                var oData = this.getView().getModel();
                var sObj1, sObj2;
                for (var x of mParam1) {
                    sObj1 = oData.getProperty("/" + x);
                    sObj2 = oData.getProperty("/" + sObj1["WorkLocation"]["__ref"])

                    aArray.push(sObj2["TownName"] + " - " + sObj2["TownId"])
                }
            }

            return aArray.join(", ")
        },
        fmtChildTowns: function (mParam1) {

            var aArray = []
            if (mParam1) {
                for (var x of mParam1) {
                    aArray.push(x["TownName"] + " - " + x["TownId"])
                }
            }

            return aArray.join(", ")

        },
        fmtDisplayChildTowns: function (mParam1) {

            var aArray = []
            if (Array.isArray(mParam1)) {
                var oData = this.getView().getModel();
                var sObj1, sObj2, sObj3;
                for (var x in mParam1) {
                    sObj1 = oData.getProperty("/" + mParam1[x]);
                    for (var y in sObj1["ChildTowns"]["__list"]) {
                        sObj2 = oData.getProperty("/" + sObj1["ChildTowns"]["__list"][y]);
                        sObj3 = oData.getProperty("/" + sObj2["WorkLocation"]["__ref"]);
                        aArray.push(sObj3["TownName"] + "-" + sObj3["TownId"]);
                    }

                }

                return aArray.join(", ")
            }
            return "Na"

        },
        fmDisplayServicePinCode: function (mParam1) {
            var aArray = []
            if (Array.isArray(mParam1)) {
                var oData = this.getView().getModel();
                var sObj1, sObj2, sObj3;
                for (var x in mParam1) {
                    sObj1 = oData.getProperty("/" + mParam1[x]);
                    for (var y in sObj1["ServicePincodes"]["__list"]) {
                        sObj2 = oData.getProperty("/" + sObj1["ServicePincodes"]["__list"][y]);
                        sObj3 = oData.getProperty("/" + sObj2["Pincode"]["__ref"]);
                        aArray.push(sObj3["Name"]);
                    }

                }

                return aArray.join(", ")
            }
            return "Na"
        }
    };

});