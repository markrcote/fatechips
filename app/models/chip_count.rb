class ChipCount < ApplicationRecord
  enum chip_type: [ :blue, :red, :white ]
  belongs_to :chip_pool
end
