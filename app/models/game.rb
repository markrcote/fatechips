class Game < ApplicationRecord
  include GraphQL::Interface

  belongs_to :chip_pool, dependent: :destroy
  has_many :player, dependent: :destroy
  validates :name, presence: true
end
