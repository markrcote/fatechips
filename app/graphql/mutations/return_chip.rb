module Mutations
  class ReturnChip < BaseMutation
    argument(:game_id, ID, required: true)
    argument(:chip_type, String, required: true)

    field(:chip_count, Types::ChipCountType, null: false)
    field(:game, Types::GameType, null: false)
    field(:errors, [String], null: false)

    def resolve(game_id:, chip_type:)
      authorize_user
      game = Game.find(game_id)
      chip_count = game.return_chip(chip_type: chip_type)
      {
        chip_count: chip_count,
        game: game,
        errors: []
      }
    end
  end
end
