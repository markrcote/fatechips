Rails.application.routes.draw do
  get 'main/index'
  root 'main#index'

  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  post "/graphql", to: "graphql#execute"

  resources :games do
    post 'take', on: :member
  end
end
