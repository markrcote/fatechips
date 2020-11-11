class ChipCount < ApplicationRecord
  enum chip_type: [ :blue, :red, :white, :legend ]
  belongs_to :chip_pool
end
