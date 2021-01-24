class User < ApplicationRecord
  include GraphQL::Interface

  has_many :player

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :token_authenticatable, :validatable
end
