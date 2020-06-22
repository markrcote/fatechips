Rails.application.routes.draw do
  resources :games do
    post 'take', on: :member
  end
end
