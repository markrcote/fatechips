class Player < ApplicationRecord
  belongs_to :game
  belongs_to :chip_pool
end
