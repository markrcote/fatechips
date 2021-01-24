class ChipPool < ApplicationRecord
  has_many :chip_count, dependent: :destroy
end
