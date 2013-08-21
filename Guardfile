guard 'jasmine', server: :jasmine_gem, port: 8888, jasmine_url: 'http://localhost:8888/' do
  watch(%r{spec/javascripts/.+\.js$})   { "spec/javascripts" }
  watch(%r{.+\.js})  { "spec/javascripts" }

  watch(%r{spec/javascripts/.+\.js$})
  watch(%r{.+\.js})
end

guard 'livereload' do
  watch(%r{.+\.(css|js|html)})
  watch(%r{spec/.+\.js})
end
