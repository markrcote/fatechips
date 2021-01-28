class Player < ApplicationRecord
  include GraphQL::Interface

  belongs_to :game
  belongs_to :user
  belongs_to :chip_pool, dependent: :destroy

  def take_chip
    taken_chip_count = game.chip_pool.take_random_chip
    return nil if taken_chip_count.nil?

    chip_pool.add_chips(taken_chip_count.chip_type)
    taken_chip_count
  end

  def return_chip(chip_type)
    chips_left = chip_pool.remove_chips(chip_type)
    if !chips_left.nil?
      game.chip_pool.add_chips(chip_type)
    end
    chips_left
  end
end
