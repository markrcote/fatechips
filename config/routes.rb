Rails.application.routes.draw do
  devise_for :users, skip: :sessions
  get 'main/index'
  root 'main#index'

  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  post "/graphql", to: "graphql#execute"

  match '*path', to: 'main#index', via: :all
end
