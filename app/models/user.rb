class User < ApplicationRecord
  include GraphQL::Interface

  has_many :player

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :token_authenticatable, :validatable

  def create_player(game:, chip_counts:)
    # chip_counts is a hash of the form type (string) => count.
    chip_pool = ChipPool.create
    chip_counts.each do |chip_type, count|
      chip_count = ChipCount.create(
        count: count,
        chip_type: chip_type,
        chip_pool_id: chip_pool.id
      )
      chip_count.save
    end
    p = Player.new(game: game, chip_pool: chip_pool, user: self)
    p.save
    p
  end
end
