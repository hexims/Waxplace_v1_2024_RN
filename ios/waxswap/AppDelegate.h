#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <RCTOneSignal.h> /* <--- Add this */



@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate>

@property (nonatomic, strong) UIWindow *window;
@property (strong, nonatomic) RCTOneSignal* oneSignal; /* <--- Add this */

@end
