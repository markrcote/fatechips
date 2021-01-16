class ChipCount < ApplicationRecord
  include GraphQL::Interface

  enum chip_type: [ :blue, :red, :white, :legend ]
  belongs_to :chip_pool
end
