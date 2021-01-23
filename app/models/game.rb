class Game < ApplicationRecord
  include GraphQL::Interface

  belongs_to :chip_pool
  has_many :player
  validates :name, presence: true
end
