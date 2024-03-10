#import "AppDelegate.h"
#import <FBSDKCoreKit/FBSDKCoreKit-swift.h>
#import <React/RCTLinkingManager.h> 
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <GoogleMaps/GoogleMaps.h>
#import <OneSignal/OneSignal.h>
//#import "RNSplashScreen.h"

#ifdef FB_SONARKIT_ENABLED
//#import <FlipperKit/FlipperClient.h>
//#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
//#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
//#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
//#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
//#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>


@import GoogleMaps;

//static void InitializeFlipper(UIApplication *application) {
//  FlipperClient *client = [FlipperClient sharedClient];
//  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
//  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
//  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
//  [client addPlugin:[FlipperKitReactPlugin new]];
//  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
//  [client start];
  
  

//}
#endif





@implementation AppDelegate

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  if ([[url scheme] isEqualToString:@"waxplace"]) {
    // Handle the deep link here
    return [RCTLinkingManager application:application openURL:url options:options];

  } else {
    // Pass the URL to the Facebook SDK if it's a login callback
    return [[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options];
  }
}
//
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [[FBSDKApplicationDelegate sharedInstance] application:application
                         didFinishLaunchingWithOptions:launchOptions];
  
[OneSignal setLogLevel:ONE_S_LL_VERBOSE visualLevel:ONE_S_LL_NONE];
    
  // OneSignal initialization
    [OneSignal initWithLaunchOptions:launchOptions];
    [OneSignal setAppId:@"59cc21e5-ba01-469b-9d98-6526437b40d8"];
//
//    // promptForPushNotifications will show the native iOS notification permission prompt.
//    // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 8)
    [OneSignal promptForPushNotificationsWithUserResponse:^(BOOL accepted) {
      NSLog(@"User accepted notifications: %d", accepted);
    }];
//
  
  // ...

  [UIApplication sharedApplication].applicationIconBadgeNumber = 0;

  //  self.oneSignal = [[RCTOneSignal alloc] initWithLaunchOptions:launchOptions appId:@"81491b70-73a6-4634-938e-c9f09e69ee8c"];
    

  [GMSServices provideAPIKey:@"AIzaSyCKnroToDbXbu7lEcpVxTXcOuZQvDWVR5I"];
//#ifdef FB_SONARKIT_ENABLED
//  InitializeFlipper(application);
//#endif

  for (NSString* family in [UIFont familyNames])
  {
    NSLog(@"%@", family);
    for (NSString* name in [UIFont fontNamesForFamilyName: family])
    {
      NSLog(@" %@", name);
    }
  }

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"waxswap"
                                            initialProperties:nil];

  if (@available(iOS 13.0, *)) {
      rootView.backgroundColor = [UIColor systemBackgroundColor];
  } else {
      rootView.backgroundColor = [UIColor whiteColor];
  }

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  
  // Get the UDID of the device
//  NSString *udid = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
//  NSLog(@"UDID: %@", udid);
//  UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"UDID" message:udid preferredStyle:UIAlertControllerStyleAlert];
//  UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"OK" style:UIAlertActionStyleDefault handler:nil];
////  [alert addAction:okAction];
//  [self.window.rootViewController presentViewController:alert animated:YES completion:nil];

  
  
  
  
  if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)
       {
           [[UIApplication sharedApplication] registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:(UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge) categories:nil]];
           [[UIApplication sharedApplication] registerForRemoteNotifications];
       }
       else
       {
           [[UIApplication sharedApplication] registerForRemoteNotificationTypes:
            (UIUserNotificationTypeBadge | UIUserNotificationTypeSound | UIUserNotificationTypeAlert)];
       }
    
    
    NSLog(@"Registering for push notifications...");
        [[UIApplication sharedApplication] registerForRemoteNotificationTypes:
    (UIRemoteNotificationTypeSound | UIRemoteNotificationTypeAlert)];
    

//  [RNSplashScreen showSplash:@"LaunchScreen" inRootView:rootView];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings // NS_AVAILABLE_IOS(8_0);
{
        [application registerForRemoteNotifications];
    }



- (void)applicationDidBecomeActive:(UIApplication *)application {
    [UIApplication sharedApplication].applicationIconBadgeNumber = 0;
    NSLog(@"application did become active");
}

//- (UIUserNotificationSettings *)getNotificationSettingsForiOS8AndAboveWithCategories:(NSSet *)categories {
//
//    UIUserNotificationType types = (UIUserNotificationTypeAlert|
//                                    UIUserNotificationTypeSound|
//                                    UIUserNotificationTypeBadge);
//
//    if (categories != nil) {
//        return [UIUserNotificationSettings settingsForTypes:types
//                                                 categories:categories];
//    } else {
//        return [UIUserNotificationSettings settingsForTypes:types
//                                                 categories:nil];
//    }
//
//}



- (void)registerForRemoteNotificationsWithActionsForApplication:(UIApplication *)application {

   

    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
//    [center setNotificationCategories:categories];
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error) {
    }];

    [application registerForRemoteNotifications];

}



- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
//     NSString *str = [NSString stringWithFormat:@"Device Token=%@",deviceToken];
//     NSLog(@"Device Token=%@", str);
  
  NSString *str = [NSString stringWithFormat:@"%@", deviceToken]; // devTokendata is NSData
      str = [str stringByReplacingOccurrencesOfString:@" " withString:@""];
      str = [str stringByReplacingOccurrencesOfString:@"<" withString:@""];
      str = [str stringByReplacingOccurrencesOfString:@">" withString:@""];
      if (@available(iOS 13, *)) {
          str = [self deviceTokenFromData:deviceToken];
      NSLog(@"APNS Token: %@",str);
        
}
}

-(NSString *)deviceTokenFromData:(NSData *)data
{
    NSUInteger dataLength = data.length;
    if (dataLength == 0) {
        return nil;
    }
    const unsigned char *dataBuffer = (const unsigned char *)data.bytes;
    NSMutableString *hexString  = [NSMutableString stringWithCapacity:(dataLength * 2)];
    for (int i = 0; i < dataLength; ++i) {
        [hexString appendFormat:@"%02x", dataBuffer[i]];
    }
    return [hexString copy];
}


- (void)application:(UIApplication *)app didFailToRegisterForRemoteNotificationsWithError:(NSError *)err {
    NSString *str = [NSString stringWithFormat: @"Error: %@", err];
     NSLog(@"Device Token error %@",str);
}





@end
