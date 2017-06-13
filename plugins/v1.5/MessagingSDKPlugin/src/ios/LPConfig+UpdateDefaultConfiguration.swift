import Foundation
import LPInfra

// Extensions to the default LPConfig object allowing config to be loaded from a JSON object.

extension LPConfig {
    
    /// Update the default configuration object with values from JSON
    ///
    /// - Parameter config: The parsed JSON configuration settings
    static func updateDefaultConfiguration(_ json: [String : AnyObject]) {
        self.defaultConfiguration.updateConfiguration(json)
    }
    
    /// Update this configuration object with values from JSON
    ///
    /// - Parameter config: The parsed JSON configuration settings
    func updateConfiguration(_ json: [String : AnyObject]) {
        json.keys.forEach({
            self.updateConfigurationProperty(json, property: $0)
        })
    }
    
    /// Indicates the type of property represented by a configuration value
    ///
    /// - Color: Property is a hex string corresponding to a UIColor
    /// - Other: Property does not require any further conversion before it can be set
    fileprivate enum ConfigType {
        case Color
        case CheckmarkState
        case LPUrlPreviewStyle
        case Other
    }
    
    /// Update the LivePerson default config for a specific property in the JSON branding object
    ///
    /// - Parameters:
    ///   - config: JSON branding  configuration
    ///   - property: Name of the property to update
    fileprivate func updateConfigurationProperty(_ json: [String : AnyObject], property: String) {
        if let value = json[property] {
            
            switch LPConfig.getConfigType(property) {
                
            case .Color:
                let color = LPConfig.colorFromHexString(value as! String)
                self.setValue(color, forKey: property)
                
            case .CheckmarkState:
                let value = LPConfig.enumFromString(value: value as! String, defaultValue: CheckmarksState.all)
                self.checkmarkVisibility = value
                
                // Avoid an unexpected behaviour
                if (json["isReadReceiptTextMode"] == nil) {
                    self.isReadReceiptTextMode = false
                }
                
            case .LPUrlPreviewStyle:
                let value = LPConfig.enumFromString(value: value as! String, defaultValue: LPUrlPreviewStyle.slim)
                self.urlPreviewStyle = value
                
            case .Other:
                self.setValue(value, forKey: property)
            }
        }
    }
    
    /// Get the type of configuration value for the configuration key provided
    ///
    /// - Parameter key: Configuration key being set
    /// - Returns: Type of configuration value being set
    fileprivate static func getConfigType(_ key: String) -> ConfigType {
        switch key {
            
        case key where key.hasSuffix("Color"):
            return ConfigType.Color
            
        case "checkmarkVisibility":
            return ConfigType.CheckmarkState
            
        case "linkPreviewStyle":
            return ConfigType.LPUrlPreviewStyle
            
        default:
            return ConfigType.Other
        }
    }
    
    /// Get the UIColor corresponding to a CSS hex color code (RGB[A] or RRGGBB[AA])
    ///
    /// - Parameter hex: A hexadecimal representation of the colou
    /// - Returns: The UIColor represented by the hexidecimal color code, or UIColor.clear if parsing failed
    fileprivate static func colorFromHexString (_ hex:String) -> UIColor {
        
        // Remove padding, leading hash symbol etc.
        let hex = hex.trimmingCharacters(in: NSCharacterSet.alphanumerics.inverted)
        
        // Parse hex string to an integer
        var int = UInt32()
        guard Scanner(string: hex).scanHexInt32(&int) else {
            return UIColor.clear
        }
        
        let r, g, b, a: UInt32
        
        // Split colour string into RGBA components
        switch hex.characters.count {
        case 3: // RGB
            (r, g, b, a) = ((int >> 8) * 17, (int >> 4 & 0xf) * 17, (int & 0xf) * 17, 255)
        case 4: // RGBA
            (r, g, b, a) = ((int >> 12) * 17, (int >> 8 & 0xf) * 17, (int >> 4 & 0xf) * 17, (int & 0xf) * 17)
        case 6: // RRGGBB
            (r, g, b, a) = (int >> 16, int >> 8 & 0xff, int & 0xff, 255)
        case 8: // RRGGBBAA
            (r, g, b, a) = (int >> 24, int >> 16 & 0xff, int >> 8 & 0xff, int & 0xff)
        default:
            return UIColor.clear
        }
        
        return UIColor(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }
    
    /// Get the enum value corresponding to a string representation
    ///
    /// - Parameters:
    ///   - value: String value to find in the enum
    ///   - defaultValue: Default enum value if string does not correspond to an enum value
    /// - Returns: Enum value corresponding to the given string, or the default enum value if none was found
    fileprivate static func enumFromString<E: RawRepresentable>(value: String, defaultValue: E) -> E where E.RawValue == Int {
        
        var i = 1
        while let item = E(rawValue: i) {
            if String(describing: item).caseInsensitiveCompare(value) == .orderedSame {
                return item
            }
            i += 1
        }
        
        print("Defaulting enum: \(String(describing: defaultValue))")
        return defaultValue
    }
    
}
