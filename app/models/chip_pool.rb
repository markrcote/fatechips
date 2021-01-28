class ChipPool < ApplicationRecord
  has_many :chip_count, dependent: :destroy

  def change_chip_count(chip_type, count)
    returned_chip_count = find_chip_count(chip_type)

    if returned_chip_count.nil?
      returned_chip_count = ChipCount.create(
        count: 0,
        chip_type: chip_type,
        chip_pool_id: id
      )
      returned_chip_count.save
    end

    # Make sure there are enough chips in the pool if we
    # are taking them away.
    if count < 0 and returned_chip_count.count < count * -1
      return nil
    end

    returned_chip_count.count += count
    returned_chip_count.save
    returned_chip_count
  end

  def add_chips(chip_type, count=1)
    return change_chip_count(chip_type, count)
  end

  def remove_chips(chip_type, count=1)
    return change_chip_count(chip_type, count * -1)
  end

  def take_random_chip
    total_chips = chip_count.sum(:count)
    return nil if total_chips == 0

    pick = rand(total_chips)
    taken_chip_count = nil
    count = 0
    chip_count.each do |cc|
      if pick < count + cc.count
        taken_chip_count = cc
        break
      end
      count += cc.count
    end

    taken_chip_count.count -= 1
    taken_chip_count.save
    return taken_chip_count
  end

  def find_chip_count(chip_type)
    target_chip_count = nil
    chip_count.each do |cc|
      if cc.chip_type == chip_type
        target_chip_count = cc
        break
      end
    end
    target_chip_count
  end
end
