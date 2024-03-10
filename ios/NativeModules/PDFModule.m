

#import "PDFModule.h"
#import <React/RCTLog.h>

@implementation PDFModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(openPDF:(NSString *)fileUri) {
    NSURL *url = [NSURL URLWithString:fileUri];
    
    if (url) {
        UIDocumentInteractionController *documentController = [UIDocumentInteractionController interactionControllerWithURL:url];
        documentController.delegate = self;

        BOOL success = [documentController presentPreviewAnimated:YES];
        if (!success) {
            [documentController presentOpenInMenuFromRect:CGRectZero inView:[[[UIApplication sharedApplication] delegate] window].rootViewController.view animated:YES];
        }
    } else {
        RCTLog(@"Invalid file URL");
    }
}

@end