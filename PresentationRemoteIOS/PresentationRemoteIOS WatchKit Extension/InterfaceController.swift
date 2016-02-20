//
//  InterfaceController.swift
//  PresentationRemoteIOS WatchKit Extension
//
//  Created by Wouter Verweirder on 20/02/16.
//  Copyright © 2016 Wouter Verweirder. All rights reserved.
//

import WatchKit
import Foundation


class InterfaceController: WKInterfaceController {
  
    let urlRoot = "https://bbridges.herokuapp.com"
    var task: NSURLSessionDataTask?

    override func awakeWithContext(context: AnyObject?) {
        super.awakeWithContext(context)
        
        // Configure interface objects here.
    }

    @IBAction func previousPressed() {
      executeButtonAction("previous")
    }
  
    @IBAction func nextPressed() {
      executeButtonAction("next")
    }
  
  func executeButtonAction(remoteKey:String) {
    let url: NSURL = NSURL(string: urlRoot + "/remote/" + remoteKey)!
    let request: NSMutableURLRequest = NSMutableURLRequest(URL: url)
    
    request.HTTPMethod = "POST"
    let stringPost="email=wouter.verweirder@gmail.com&password=geheim" // Key and Value
    let data = stringPost.dataUsingEncoding(NSUTF8StringEncoding)
    
    request.timeoutInterval = 60
    request.HTTPBody=data
    request.HTTPShouldHandleCookies=false
    
    let conf = NSURLSessionConfiguration.defaultSessionConfiguration()
    let session = NSURLSession(configuration: conf)
    
    task = session.dataTaskWithRequest(request) { (data, res, error) -> Void in
      if let e = error {
        print("dataTaskWithRequest fail: \(e.debugDescription)")
        return
      }
      if let d = data {
        let result = NSString(data: d, encoding:
          NSUTF8StringEncoding)!
        print(result);
      }
    }
    task!.resume()
  }
  
    override func willActivate() {
        // This method is called when watch view controller is about to be visible to user
        super.willActivate()
    }

    override func didDeactivate() {
        // This method is called when watch view controller is no longer visible
        super.didDeactivate()
    }

}
