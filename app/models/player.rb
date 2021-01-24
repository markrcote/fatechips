class Player < ApplicationRecord
  belongs_to :game
  belongs_to :user
  belongs_to :chip_pool, dependent: :destroy
end
