//
//  InterfaceController.swift
//  PresentationRemoteIOS WatchKit Extension
//
//  Created by Wouter Verweirder on 05/09/15.
//  Copyright (c) 2015 Wouter Verweirder. All rights reserved.
//

import WatchKit
import Foundation


class InterfaceController: WKInterfaceController {
    
    //let urlRoot = "http://192.168.1.11:5000";
    let urlRoot = "http://bbridges.herokuapp.com";

    override func awakeWithContext(context: AnyObject?) {
        super.awakeWithContext(context)
        
        // Configure interface objects here.
    }

    @IBAction func previousPressed() {
        NSLog("previous");
        executeButtonAction("previous");
    }
    
    
    @IBAction func nextPressed() {
        executeButtonAction("next");
    }
    
    func executeButtonAction(remoteKey:String) {
        var url: NSURL = NSURL(string: urlRoot + "/remote/" + remoteKey)!
        var request1: NSMutableURLRequest = NSMutableURLRequest(URL: url)
        
        request1.HTTPMethod = "POST"
        var stringPost="email=wouter.verweirder@gmail.com&password=geheim" // Key and Value
        
        let data = stringPost.dataUsingEncoding(NSUTF8StringEncoding)
        
        request1.timeoutInterval = 60
        request1.HTTPBody=data
        request1.HTTPShouldHandleCookies=false
        
        let queue:NSOperationQueue = NSOperationQueue()
        
        NSURLConnection.sendAsynchronousRequest(request1, queue: queue, completionHandler:{ (response: NSURLResponse!, data: NSData!, error: NSError!) -> Void in
            var err: NSError
            var jsonResult: NSDictionary = NSJSONSerialization.JSONObjectWithData(data, options: NSJSONReadingOptions.MutableContainers, error: nil) as! NSDictionary
            println("AsSynchronous\(jsonResult)")
        })
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
