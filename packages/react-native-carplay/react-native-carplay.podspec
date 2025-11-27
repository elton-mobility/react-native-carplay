require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'react-native-carplay'
  s.version      = package['version']
  s.summary      = package['description']

  s.homepage     = package['repository']['url']

  s.license      = package['license']
  s.authors      = { 'Tommy Nordli' => 'tommy@nordli.io' }
  s.ios.deployment_target = '14.0'

  s.source       = { :git => "https://github.com/elton-mobility/react-native-carplay.git", :tag => "v#{s.version}" }

  s.source_files  = "ios/*.{h,m,swift}"

  s.dependency 'React'
end
