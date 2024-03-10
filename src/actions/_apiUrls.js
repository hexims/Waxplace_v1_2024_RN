/* BASE URL AND API PATHS*/



///export const BASEURL = 'https://devapi.waxplace.co/';  // DEVELOPMENT API

 export const BASEURL = 'https://platform.waxplace.co/'; //PRODUCTION API




export const USERREGISTER = 'users/userRegistration';
export const USERLOGIN = 'users/userLogin';
export const RELEASESAPI = 'releases/getReleases';
export const GETPROFILEDETAILS = 'users/getUserProfile';
export const GETCATEGORIES = 'settings/getCategories';
export const SAVECATEGORIES = 'releases/saveCategories';
export const ADDTOWISHLIST = 'releases/AddtoWishlist';
export const REMOVEFROMWISHLIST = 'releases/RemoveFromWishList';
export const GETWISHLISTOFUSER = 'users/getuserWishlistById';
export const GETCOLLECTIONSOFUSER = 'users/getuserCollectionsById/';
export const GETFEATUREDLIST = 'releases/getRandomFeturedItems';
export const GETACTIVEWEEKLYDROP = 'artist/getActiveWeeklyDrop';
export const GETRECENTWEEKLYDROPS = 'artist/getWeeklyDrops';
export const ADDTOCOLLECTION = 'releases/AddtoCollections';
export const REMOVEFROMCOLLECTION = 'releases/RemoveFromCollections';
export const GETSALEPRODUCTS = 'releases/getSaleProducts';
export const ADDSALEPRODUCT = 'releases/addSaleProduct';
export const SAVEIMAGE = 'vendor/saveimage';
export const ADDSALEVENDORPRODUCT = 'vendor/addSaleVendorProduct';
export const EDITSALEVENDORPRODUCT = 'vendor/editVendorSaleProduct';
export const DELETESALEVENDORPRODUCT = '/vendor/deleteSaleVendorProduct';
export const SALEPRODUCTCOPY = 'vendor/productCopy';
export const ADDPRODUCTTOUSERCART = 'users/addProductToUserCart';
export const GETRANDOMPROMOTIONS = 'promotion/getRandomPromotions';
export const GETAPPCONTENTS = 'app-content/getAppContents';
export const REMOVEPRODUCTFROMUSERCART = 'users/removeProductFromUserCart';
export const ADDAMOUNTTOUSER = 'users/addAmountToUser';
export const UPDATEBALANCEUSER = 'users/addTokenToUser';
export const ADDTOKENTOUSER = 'users/addPurchaseToken';
export const GETALBUMSBYBARCODE = 'users/getBarcodeAlbumDetails';
export const GETINDIVIDUALALBUM = 'users/getIndivisualAlbumDetails/';
export const GETSALEPRODUCTSBYCATEGORIES =
  'releases/getSaleProductsByCategories';
export const GETFEATUREDITEMSBYCATEGORIES = 'users/feaureSaleProductDetails';
export const GETDEFAULTALBUMS = 'settings/getDefaultAlbums';
export const GETVENDORLIST = 'vendor/getVendorList';
export const PURCHASEALBUM = 'releases/purchaseOneAlbum';
export const CHANGESALEPRODUCTFEATURESTATUS =
  'releases/changeSaleProductFeatureStatus';
export const CHANGESALEPRODUCTENABLESTATUS =
  'releases/changeSaleProductEnableStatus';
export const GETUSERCART = 'users/getUserCart/';
export const GETUSERFRIENDS = 'users/getUserFriends/';
// export const GETUSERPICKUPS = 'users/getUserPickUps/';
export const ADDFRIENDTOUSER = 'users/addFriendToUser';
export const GETUSERSALEPRODUCTS = 'releases/getUserSaleProducts';
export const GETVENDORSBYFILTER = 'vendor/getVendorsByFilter';
export const EDITUSERPROFILE = 'users/editUserProfile';
export const GETVENDORPRODUCTSALES = 'releases/getVendorSaleProducts';
export const GETVENDORFILTERDATA = 'releases/getVendorSaleProductsByFilter';
export const GETVENDORPROMOTION = 'promotion/getVendorPromotionByVendorId';
export const SUBSCRIBEUSER = 'users/updateUserSubscription';
export const GETALL24HOURACCESS = 'vendor/getAllOneDayAccessProducts';

export const GETVENDOREVENT = 'vendor/getVendorEvent';
export const REMOVEFROMFRIEND = 'users/removeFriendToUser';
export const ADDALBUM = 'settings/addDefaultAlbumDetails';
export const GETUSERORDERS = 'users/getUserOrders';
export const GETCOUNTRIES = 'users/getCountries';
export const GETCITIESBYCOUNTRIES = 'users/getCitiesofcountry';
export const FORGOTPASSWORD = 'users/forgotUserPassword';
export const CHANGEPASSWORD = 'users/changePassword';
export const ARCHIVEWEEKLYDROP = 'users/addRecentDropstoUser';
export const GETDATAWITHBARCODE = 'artist/getReleasesByBarcode/';
export const GETRECENTPROFILEWEEKLYDROPS = 'users/getrecentDrops';
export const CANCELUSERSUBSCRIPTION = 'vendor/cancelStripeSubscription';
export const CANCELSUBSCRIPTION = 'users/cancelUserSubscription';
export const WITHDRAWUSERBALANCE = 'vendor/getVendorWithdrawApprove';
export const UPDATEUSERSUBSCRIPTION = 'users/updateUserSubscription';
export const USERNAMECHECK = 'users/checkUserExist';
export const SHARECODECHECK = 'users/checkShareCodeExists';
export const SENDWEEKLYDROPREQUEST = 'artist/sendWeeklyDropRequest';
export const GETNOTIFICATIONS = 'users/getuserNotification';
export const REMOVENOTIFICATIONS = 'users/deleteuserNotification';
export const DELETEUSERACCOUNT = 'users/deleteUser';
export const TERMSANDCONDITIONS = 'admin/getDeleteTerms';
export const USERGENERATEOTP = 'users/userGenerateOtp';
export const GETVENDORNOTIFICATION = 'vendor/callNearbyVendors';
export const GETALBUMBYBARCODE = 'releases/getAlbumByBarCode';
export const GETCOLLECTIONVALUE = 'releases/getCollectionValue';
export const GETUSERORDERDETIALS = 'releases/getOrderDetails';
export const SENDPRODUCTRETURNREQUEST = 'releases/returnPurcaseProduct';
export const ADDSHIPPINGDETAILS = 'releases/addShippingDetails';
export const GETSALESLIST = 'releases/getSellerProducts';
export const RETURNSOLDPRODUCT = 'users/returnSoldProduct';
export const SAVERETURNCHATDATA = 'users/saveReturnUserMessages';
export const GETRETURNCHATDATA = 'users/returnUserList';
export const CANCELSHIPMENT = 'users/shipmentCancelled';
export const REJECTSALESORDER = 'releases/rejectOrderByVendorAndUser';
export const GETUSERPICKUPS = 'users/getBuyerdeliveredDetails';
export const SAVEUSERPICKUPINFO = 'users/userTakePickup';
export const MAKECHECKOUTLOCK = 'releases/makeAlbumLock';
export const MAKECHECKOUTUNLOCK = 'releases/makeAblumUnlock';
export const GENERATEOTPFORREGISTRATION = 'users/generateOtpForLogin';
export const COMPAREEMAILANDOTP = 'users/compareEmailAndOtp';
export const GETTAXPERCENT = 'settings/gettaxes';
export const GETWALLETHISTORY = 'users/getUserWalletReport';
export const GETVENDORDETAILS = 'vendor/getVendorDetails';
export const SENDALBUMREPORT = 'users/sendEmailToAdmin';
export const SETDEFAULTPRODUCT = 'vendor/setDefaultProduct';
export const SENDTWILLOOTP = 'users/sendTwiloMessage';
export const COMPARETWILLOOTP = 'users/compareTwiloMsgOtp';
// export const WITHDRAWALREQUEST = 'admin/withdrawalrequestApproval';

//CORREOS APIS
export const CREATECORREOSPREREGISTRATION = 'correos/preRegistaration';
export const CANCELPREREGISTRATION = 'correos/cancelPreRegistration';
export const GETCORREOSLABEL = 'correos/labelRequest';
export const CREATECORREOSPICKUPREQUEST = 'correos/createPickupRequest';
export const CANCELCORREOSPICKUPREQUEST = 'correos/cancelPickupRequest';
export const CHECKNEARBYPOSTALCENTERS = 'correos/checkNearbyPostalCenters';
export const CHECKDELIVERYPOSTALCODES =
  'correos/checkTAPDelivarablePostalCodes';

export const GETCURRENTCORREOSSHIPMENTSTATUS =
  'correos/getCurrentShipmentStatus/';
export const ELECTRONICPROOFOFDELIVERY = 'correos/electronicProofOfDelivery';
export const GETZONEBASEDPRICE = 'settings/getZonePrice';
export const DECODECVV = 'vendor/compareCvv';
export const SAVECREDITCARDS = '';
export const SENDKYCRESULTS = 'vendor/storeKycDetails';
export const SAVEBANKACCOUNT = 'vendor/saveBankInformation';
export const DELETECARD = 'users/deleteCreditCardInfo';
export const DELETEUSERBANKACCOUNT = 'users/removeBankAccountFromDb';
export const GETORDERIDDETAILS = 'users/getDetailsByOrderId';
export const GETMANGOPAYAUTHTOKEN ='users/getMangoPayAuthToken'