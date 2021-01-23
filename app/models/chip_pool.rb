class ChipPool < ApplicationRecord
  has_many :chip_count, dependent: :destroy

  def take_chip
    total_chips = chip_count.sum(:count)
    return nil if total_chips == 0

    pick = rand(total_chips)
    taken_chip_count = nil
    count = 0
    chip_count.each do |pool_chip_count|
      if pick < count + pool_chip_count.count
        taken_chip_count = pool_chip_count
        break
      end
      count += pool_chip_count.count
    end

    taken_chip_count.count -= 1
    taken_chip_count.save
    return taken_chip_count
  end

  def return_chip(chip_type:)
    returned_chip_count = nil
    chip_count.each do |pool_chip_count|
      if pool_chip_count.chip_type == chip_type
        returned_chip_count = pool_chip_count
        break
      end
    end

    if !returned_chip_count.nil?
      returned_chip_count.count += 1
      returned_chip_count.save
    end

    returned_chip_count
  end
end
