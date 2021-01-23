module Mutations
  class TakeChip < BaseMutation
    argument(:game_id, ID, required: true)

    field(:chip_type, String, null: false)
    field(:game, Types::GameType, null: false)
    field(:errors, [String], null: false)

    def resolve(game_id:)
      authorize_user
      game = Game.find(game_id)
      chip_count = game.chip_pool.take_chip
      {
        chip_type: chip_count.chip_type,
        game: game,
        errors: []
      }
    end
  end
end
