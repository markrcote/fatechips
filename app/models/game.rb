class Game < ApplicationRecord
  include GraphQL::Interface

  belongs_to :chip_pool
  has_many :player
  validates :name, presence: true

  def take_chip
    total_chips = chip_pool.chip_count.sum(:count)
    return nil if total_chips == 0

    pick = rand(total_chips)
    chip_count = nil
    count = 0
    chip_pool.chip_count.each do |pool_chip_count|
      if pick < count + pool_chip_count.count
        chip_count = pool_chip_count
        break
      end
      count += pool_chip_count.count
    end

    chip_count.count -= 1
    chip_count.save
    return chip_count
  end

  def return_chip(chip_type:)
    chip_count = nil
    chip_pool.chip_count.each do |pool_chip_count|
      if pool_chip_count.chip_type == chip_type
        chip_count = pool_chip_count
        break
      end
    end

    if !chip_count.nil?
      chip_count.count += 1
      chip_count.save
    end

    chip_count
  end

  def chips
    chip_pool.chip_count.all
  end
end
