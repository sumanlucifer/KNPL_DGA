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

        arrayFormat: function(mParam1){
            
            var omodel = this.getView().getModel();
           var svalue= "NA";
           var avalue= [];
            if(mParam1){
                if(mParam1.length>0){
                    avalue = mParam1.map(function(o){
                      
                        return   omodel.getProperty("/"+o).DepotId ;
                    })
                    svalue = avalue.join(", ");
                    return svalue;

                }
                else
                return svalue;
              //  return mParam1.results.DepotId.toString();
            }
            else 
            return svalue ;
            
        },
        arrayFormat1: function(mParam1){
            
            var omodel = this.getView().getModel();
           var svalue= "NA";
           var avalue= [];
            if(mParam1){
                if(mParam1.length>0){
                    avalue = mParam1.map(function(o){
                      
                        return   omodel.getProperty("/"+o).DivisionId ;
                    })
                    svalue = avalue.join(", ");
                    return svalue;

                }
                else
                return svalue;
              //  return mParam1.results.DepotId.toString();
            }
            else 
            return svalue ;
            
        },
        arrayFormat2: function(mParam1){
            
            var omodel = this.getView().getModel();
           var svalue= "NA";
           var avalue= [];
            if(mParam1){
                if(mParam1.length>0){
                    avalue = mParam1.map(function(o){
                      
                        return   omodel.getProperty("/"+o).ZoneId ;
                    })
                    svalue = avalue.join(", ");
                    return svalue;

                }
                else
                return svalue;
              //  return mParam1.results.DepotId.toString();
            }
            else 
            return svalue ;
            
        },
        arrayFormat3: function(mParam1){
            
            var omodel = this.getView().getModel();
           var svalue= "NA";
           var avalue= [];
            if(mParam1){
                if(mParam1.length>0){
                    avalue = mParam1.map(function(o){
                      var prop1 = omodel.getProperty("/"+o).JobLocationDetails.__ref;
                      var prop2 = omodel.getProperty("/"+prop1);
                        return   prop2.TownName ;
                    })
                    svalue = avalue.join(", ");
                    return svalue;

                }
                else
                return svalue;
              //  return mParam1.results.DepotId.toString();
            }
            else 
            return svalue ;
            
        }






    };

});