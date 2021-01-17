Rails.autoloaders.each do |autoloader|
  autoloader.inflector.inflect(
    "graph_ql" => "GraphQL"
  )
end
