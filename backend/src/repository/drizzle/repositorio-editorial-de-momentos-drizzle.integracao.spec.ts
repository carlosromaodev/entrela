import { createHash, randomUUID } from 'node:crypto'

import { describe, expect, it } from 'vitest'

import {
  criarBaseDeDados,
  type LigacaoComBaseDeDados,
} from '../../lib/base-de-dados/criar-base-de-dados.js'
import {
  membrosDoNegocio,
  negocios,
  eventosDeInteracao,
  pontosDeAcesso,
  sessoesDeInteracao,
  utilizadores,
} from '../../../drizzle/schema.js'
import { RepositorioDeMomentosDrizzle } from './repositorio-de-momentos-drizzle.js'
import { RepositorioEditorialDeMomentosDrizzle } from './repositorio-editorial-de-momentos-drizzle.js'
import { RepositorioDeAcessoPublicoAMomentosDrizzle } from './repositorio-de-acesso-publico-a-momentos-drizzle.js'
import { eq, sql } from 'drizzle-orm'

// Só corre contra um PostgreSQL 18 real, com um papel que não seja
// superutilizador (ver 004-persistencia-real-em-postgresql-18.md).
const urlDeIntegracao = process.env.URL_DE_BASE_DE_DADOS_DE_INTEGRACAO

describe.skipIf(!urlDeIntegracao)(
  'RepositorioEditorialDeMomentosDrizzle num PostgreSQL 18 real',
  () => {
    async function prepararNegocioComMembro(
      ligacao: LigacaoComBaseDeDados,
    ): Promise<Readonly<{ negocioId: string; utilizadorId: string }>> {
      const utilizadorId = randomUUID()
      const negocioId = randomUUID()

      await ligacao.baseDeDados.insert(utilizadores).values({
        email: `${utilizadorId}@teste.entrela.invalid`,
        id: utilizadorId,
        nomeDeApresentacao: 'Criador de teste',
      })

      await ligacao.baseDeDados.transaction(async (transacao) => {
        await transacao.execute(
          sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
        )
        await transacao.insert(negocios).values({
          codigoDoPais: 'AO',
          id: negocioId,
          identificadorPublico: `negocio-${negocioId}`,
          nomeDeApresentacao: 'Negócio de teste',
          tipo: 'PESSOAL',
        })
        await transacao.insert(membrosDoNegocio).values({
          estado: 'ATIVO',
          id: randomUUID(),
          negocioId,
          papel: 'PROPRIETARIO',
          utilizadorId,
        })
      })

      return { negocioId, utilizadorId }
    }

    it('cria, edita, publica e relê um Momento de ponta a ponta', async () => {
      const ligacao = criarBaseDeDados(urlDeIntegracao as string)
      try {
        const { negocioId, utilizadorId } =
          await prepararNegocioComMembro(ligacao)

        const repositorioDeCriacao = new RepositorioDeMomentosDrizzle(
          ligacao.baseDeDados,
        )
        const repositorio = new RepositorioEditorialDeMomentosDrizzle(
          ligacao.baseDeDados,
          { gerarId: () => randomUUID() },
        )

        const momentoId = randomUUID()
        const versaoId = randomUUID()
        await repositorioDeCriacao.criarRascunho({
          conteudo: {
            idioma: 'pt-AO',
            nomeDoDestinatario: 'Ana',
            titulo: 'Rascunho inicial',
          },
          experiencia: {
            categoria: 'MOMENTOS',
            criadoPorUtilizadorId: utilizadorId,
            estado: 'RASCUNHO',
            fusoHorario: 'Africa/Luanda',
            id: momentoId,
            idiomaPredefinido: 'pt-AO',
            negocioId,
            versaoDeRascunhoAtualId: versaoId,
            versaoPublicadaId: null,
          },
          versao: {
            criadoPorUtilizadorId: utilizadorId,
            estado: 'RASCUNHO',
            experienciaId: momentoId,
            id: versaoId,
            numero: 1,
          },
        })

        const rascunhoRecemCriado = await repositorio.obterRascunho(
          negocioId,
          momentoId,
        )
        expect(rascunhoRecemCriado).toMatchObject({
          estado: 'RASCUNHO',
          etapas: [],
          titulo: 'Rascunho inicial',
        })

        await repositorio.atualizarRascunho(negocioId, momentoId, {
          abertura: { fusoHorario: 'Africa/Luanda', modo: 'ABRIR_AGORA' },
          capa: { corHexadecimal: '#6D4AFF', tipo: 'COR' },
          etapas: [
            {
              chave: 'revelacao-final',
              final: true,
              ordem: 1,
              texto: 'A revelação.',
            },
          ],
          titulo: 'Uma surpresa real em PostgreSQL',
        })

        const rascunhoEditado = await repositorio.obterRascunho(
          negocioId,
          momentoId,
        )
        expect(rascunhoEditado).toMatchObject({
          capa: { corHexadecimal: '#6D4AFF', tipo: 'COR' },
          estado: 'RASCUNHO',
          titulo: 'Uma surpresa real em PostgreSQL',
        })
        expect(rascunhoEditado?.etapas).toEqual([
          {
            chave: 'revelacao-final',
            final: true,
            ordem: 1,
            texto: 'A revelação.',
          },
        ])

        const papel = await repositorio.obterPapelDoUtilizador(
          negocioId,
          utilizadorId,
        )
        expect(papel).toBe('PROPRIETARIO')

        const semDireito = await repositorio.possuiDireitoAtivo(
          negocioId,
          'PUBLICAR_MOMENTO',
        )
        expect(semDireito).toBe(false)

        const pontoUrlId = randomUUID()
        const pontoQrId = randomUUID()
        const hmacUnicoUrl = createHash('sha256').update(`url:${momentoId}`).digest('hex')
        const hmacUnicoQr = createHash('sha256').update(`qr:${momentoId}`).digest('hex')
        const somaDeVerificacaoUnica = createHash('sha256')
          .update(`soma:${momentoId}`)
          .digest('hex')
        await repositorio.publicarAtomico({
          abreEm: new Date().toISOString(),
          estadoDaExperiencia: 'PUBLICADA',
          estadoDaVersao: 'PUBLICADA',
          momentoId,
          negocioId,
          pontosDeAcesso: [
            {
              canalDeOrigem: 'LINK',
              estado: 'ATIVO',
              hmacDoToken: hmacUnicoUrl,
              id: pontoUrlId,
              momentoId,
              tipo: 'URL',
              versaoId,
            },
            {
              canalDeOrigem: 'QR',
              estado: 'ATIVO',
              hmacDoToken: hmacUnicoQr,
              id: pontoQrId,
              momentoId,
              tipo: 'QR',
              versaoId,
            },
          ],
          publicadoEm: new Date().toISOString(),
          somaDeVerificacao: somaDeVerificacaoUnica,
          versaoId,
        })

        const rascunhoPublicado = await repositorio.obterRascunho(
          negocioId,
          momentoId,
        )
        expect(rascunhoPublicado).toMatchObject({
          estado: 'PUBLICADA',
          titulo: 'Uma surpresa real em PostgreSQL',
        })
      } finally {
        await ligacao.encerrar()
      }
    })

    it('nega leitura e edição do rascunho a partir de outro negócio', async () => {
      const ligacao = criarBaseDeDados(urlDeIntegracao as string)
      try {
        const negocioA = await prepararNegocioComMembro(ligacao)
        const negocioB = await prepararNegocioComMembro(ligacao)

        const repositorioDeCriacao = new RepositorioDeMomentosDrizzle(
          ligacao.baseDeDados,
        )
        const repositorio = new RepositorioEditorialDeMomentosDrizzle(
          ligacao.baseDeDados,
          { gerarId: () => randomUUID() },
        )

        const momentoId = randomUUID()
        const versaoId = randomUUID()
        await repositorioDeCriacao.criarRascunho({
          conteudo: { idioma: 'pt-AO', titulo: 'Segredo do negócio A' },
          experiencia: {
            categoria: 'MOMENTOS',
            criadoPorUtilizadorId: negocioA.utilizadorId,
            estado: 'RASCUNHO',
            fusoHorario: 'Africa/Luanda',
            id: momentoId,
            idiomaPredefinido: 'pt-AO',
            negocioId: negocioA.negocioId,
            versaoDeRascunhoAtualId: versaoId,
            versaoPublicadaId: null,
          },
          versao: {
            criadoPorUtilizadorId: negocioA.utilizadorId,
            estado: 'RASCUNHO',
            experienciaId: momentoId,
            id: versaoId,
            numero: 1,
          },
        })
        await repositorio.atualizarRascunho(negocioA.negocioId, momentoId, {
          etapas: [{ chave: 'final', final: true, ordem: 1, texto: 'segredo' }],
        })

        const leituraCruzada = await repositorio.obterRascunho(
          negocioB.negocioId,
          momentoId,
        )
        expect(leituraCruzada).toBeNull()

        await expect(
          repositorio.atualizarRascunho(negocioB.negocioId, momentoId, {
            titulo: 'Tentativa de sequestro do rascunho',
          }),
        ).rejects.toThrow('RASCUNHO_INEXISTENTE')

        const rascunhoIntacto = await repositorio.obterRascunho(
          negocioA.negocioId,
          momentoId,
        )
        expect(rascunhoIntacto?.titulo).toBe('Segredo do negócio A')
      } finally {
        await ligacao.encerrar()
      }
    })

    it('nunca deixa duas publicações concorrentes do mesmo rascunho vencerem', async () => {
      const ligacao = criarBaseDeDados(urlDeIntegracao as string)
      try {
        const { negocioId, utilizadorId } =
          await prepararNegocioComMembro(ligacao)
        const repositorioDeCriacao = new RepositorioDeMomentosDrizzle(
          ligacao.baseDeDados,
        )
        const repositorio = new RepositorioEditorialDeMomentosDrizzle(
          ligacao.baseDeDados,
          { gerarId: () => randomUUID() },
        )

        const momentoId = randomUUID()
        const versaoId = randomUUID()
        await repositorioDeCriacao.criarRascunho({
          conteudo: { idioma: 'pt-AO', titulo: 'Corrida de publicação' },
          experiencia: {
            categoria: 'MOMENTOS',
            criadoPorUtilizadorId: utilizadorId,
            estado: 'RASCUNHO',
            fusoHorario: 'Africa/Luanda',
            id: momentoId,
            idiomaPredefinido: 'pt-AO',
            negocioId,
            versaoDeRascunhoAtualId: versaoId,
            versaoPublicadaId: null,
          },
          versao: {
            criadoPorUtilizadorId: utilizadorId,
            estado: 'RASCUNHO',
            experienciaId: momentoId,
            id: versaoId,
            numero: 1,
          },
        })

        function publicacao(sufixo: string) {
          return repositorio.publicarAtomico({
            abreEm: new Date().toISOString(),
            estadoDaExperiencia: 'PUBLICADA',
            estadoDaVersao: 'PUBLICADA',
            momentoId,
            negocioId,
            pontosDeAcesso: [
              {
                canalDeOrigem: 'LINK',
                estado: 'ATIVO',
                hmacDoToken: createHash('sha256')
                  .update(`${sufixo}:url:${momentoId}`)
                  .digest('hex'),
                id: randomUUID(),
                momentoId,
                tipo: 'URL',
                versaoId,
              },
              {
                canalDeOrigem: 'QR',
                estado: 'ATIVO',
                hmacDoToken: createHash('sha256')
                  .update(`${sufixo}:qr:${momentoId}`)
                  .digest('hex'),
                id: randomUUID(),
                momentoId,
                tipo: 'QR',
                versaoId,
              },
            ],
            publicadoEm: new Date().toISOString(),
            somaDeVerificacao: createHash('sha256')
              .update(`${sufixo}:soma:${momentoId}`)
              .digest('hex'),
            versaoId,
          })
        }

        const hmacDuplicado = createHash('sha256')
          .update(`rollback:${momentoId}`)
          .digest('hex')
        await expect(
          repositorio.publicarAtomico({
            abreEm: new Date().toISOString(),
            estadoDaExperiencia: 'PUBLICADA',
            estadoDaVersao: 'PUBLICADA',
            momentoId,
            negocioId,
            pontosDeAcesso: [
              {
                canalDeOrigem: 'LINK',
                estado: 'ATIVO',
                hmacDoToken: hmacDuplicado,
                id: randomUUID(),
                momentoId,
                tipo: 'URL',
                versaoId,
              },
              {
                canalDeOrigem: 'QR',
                estado: 'ATIVO',
                hmacDoToken: hmacDuplicado,
                id: randomUUID(),
                momentoId,
                tipo: 'QR',
                versaoId,
              },
            ],
            publicadoEm: new Date().toISOString(),
            somaDeVerificacao: createHash('sha256')
              .update(`rollback:soma:${momentoId}`)
              .digest('hex'),
            versaoId,
          }),
        ).rejects.toBeDefined()

        const depoisDoRollback = await repositorio.obterRascunho(
          negocioId,
          momentoId,
        )
        expect(depoisDoRollback?.estado).toBe('RASCUNHO')
        const portasDepoisDoRollback = await ligacao.baseDeDados.transaction(
          async (transacao) => {
            await transacao.execute(
              sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
            )
            return transacao
              .select({ id: pontosDeAcesso.id })
              .from(pontosDeAcesso)
              .where(eq(pontosDeAcesso.experienciaId, momentoId))
          },
        )
        expect(portasDepoisDoRollback).toHaveLength(0)

        const resultados = await Promise.allSettled([
          publicacao('A'),
          publicacao('B'),
        ])

        const sucedidas = resultados.filter((r) => r.status === 'fulfilled')
        const falhadas = resultados.filter((r) => r.status === 'rejected')
        expect(sucedidas).toHaveLength(1)
        expect(falhadas).toHaveLength(1)

        const rascunhoFinal = await repositorio.obterRascunho(
          negocioId,
          momentoId,
        )
        expect(rascunhoFinal?.estado).toBe('PUBLICADA')

        const portasFinais = await ligacao.baseDeDados.transaction(
          async (transacao) => {
            await transacao.execute(
              sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
            )
            return transacao
              .select({
                estado: pontosDeAcesso.estado,
                hmac: pontosDeAcesso.hmacDoTokenPublico,
              })
              .from(pontosDeAcesso)
              .where(eq(pontosDeAcesso.experienciaId, momentoId))
          },
        )
        expect(portasFinais).toHaveLength(2)
        expect(portasFinais.every(({ estado }) => estado === 'ATIVO')).toBe(true)
        const hmacsFinais = new Set(portasFinais.map(({ hmac }) => hmac))
        const conjuntoA = new Set([
          createHash('sha256').update(`A:url:${momentoId}`).digest('hex'),
          createHash('sha256').update(`A:qr:${momentoId}`).digest('hex'),
        ])
        const conjuntoB = new Set([
          createHash('sha256').update(`B:url:${momentoId}`).digest('hex'),
          createHash('sha256').update(`B:qr:${momentoId}`).digest('hex'),
        ])
        expect(
          [...hmacsFinais].every((hmac) => conjuntoA.has(hmac)) ||
            [...hmacsFinais].every((hmac) => conjuntoB.has(hmac)),
        ).toBe(true)
      } finally {
        await ligacao.encerrar()
      }
    })

    it('revoga e regenera portas de acesso mantendo a experiência publicada', async () => {
      const ligacao = criarBaseDeDados(urlDeIntegracao as string)
      try {
        const { negocioId, utilizadorId } =
          await prepararNegocioComMembro(ligacao)
        const repositorioDeCriacao = new RepositorioDeMomentosDrizzle(
          ligacao.baseDeDados,
        )
        const repositorio = new RepositorioEditorialDeMomentosDrizzle(
          ligacao.baseDeDados,
          { gerarId: () => randomUUID() },
        )

        const momentoId = randomUUID()
        const versaoId = randomUUID()
        await repositorioDeCriacao.criarRascunho({
          conteudo: { idioma: 'pt-AO', titulo: 'Momento a revogar' },
          experiencia: {
            categoria: 'MOMENTOS',
            criadoPorUtilizadorId: utilizadorId,
            estado: 'RASCUNHO',
            fusoHorario: 'Africa/Luanda',
            id: momentoId,
            idiomaPredefinido: 'pt-AO',
            negocioId,
            versaoDeRascunhoAtualId: versaoId,
            versaoPublicadaId: null,
          },
          versao: {
            criadoPorUtilizadorId: utilizadorId,
            estado: 'RASCUNHO',
            experienciaId: momentoId,
            id: versaoId,
            numero: 1,
          },
        })
        const hmacDaPortaOriginal = createHash('sha256')
          .update(`revogar:url:${momentoId}`)
          .digest('hex')
        await repositorio.publicarAtomico({
          abreEm: new Date().toISOString(),
          estadoDaExperiencia: 'PUBLICADA',
          estadoDaVersao: 'PUBLICADA',
          momentoId,
          negocioId,
          pontosDeAcesso: [
            {
              canalDeOrigem: 'LINK',
              estado: 'ATIVO',
              hmacDoToken: hmacDaPortaOriginal,
              id: randomUUID(),
              momentoId,
              tipo: 'URL',
              versaoId,
            },
          ],
          publicadoEm: new Date().toISOString(),
          somaDeVerificacao: createHash('sha256')
            .update(`revogar:soma:${momentoId}`)
            .digest('hex'),
          versaoId,
        })

        const experienciaPublicada = await repositorio.obterExperiencia(
          negocioId,
          momentoId,
        )
        expect(experienciaPublicada).toMatchObject({
          estado: 'PUBLICADA',
          versaoPublicadaId: versaoId,
        })

        await expect(
          repositorio.substituirPontosDeAcessoAtomico(negocioId, momentoId, [
            {
              canalDeOrigem: 'LINK',
              estado: 'ATIVO',
              hmacDoToken: hmacDaPortaOriginal,
              id: randomUUID(),
              momentoId,
              tipo: 'URL',
              versaoId,
            },
          ]),
        ).rejects.toBeDefined()

        const portasDepoisDoRollback = await ligacao.baseDeDados.transaction(
          async (transacao) => {
            await transacao.execute(
              sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
            )
            return transacao
              .select({ estado: pontosDeAcesso.estado })
              .from(pontosDeAcesso)
              .where(eq(pontosDeAcesso.experienciaId, momentoId))
          },
        )
        expect(portasDepoisDoRollback).toEqual([{ estado: 'ATIVO' }])

        await repositorio.substituirPontosDeAcessoAtomico(
          negocioId,
          momentoId,
          [
            {
              canalDeOrigem: 'LINK',
              estado: 'ATIVO',
              hmacDoToken: createHash('sha256')
                .update(`regenerado:url:${momentoId}`)
                .digest('hex'),
              id: randomUUID(),
              momentoId,
              tipo: 'URL',
              versaoId,
            },
          ],
        )
        const contagem = await ligacao.baseDeDados.transaction(
          async (transacao) => {
            await transacao.execute(
              sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
            )
            return transacao
              .select({ estado: pontosDeAcesso.estado })
              .from(pontosDeAcesso)
              .where(eq(pontosDeAcesso.experienciaId, momentoId))
          },
        )
        expect(contagem).toHaveLength(2)
        expect(
          contagem.filter((linha) => linha.estado === 'REVOGADO'),
        ).toHaveLength(1)
        expect(contagem.filter((linha) => linha.estado === 'ATIVO')).toHaveLength(1)

        function portasDaGeracao(sufixo: string) {
          return [
            {
              canalDeOrigem: 'LINK' as const,
              estado: 'ATIVO' as const,
              hmacDoToken: createHash('sha256')
                .update(`${sufixo}:url:${momentoId}`)
                .digest('hex'),
              id: randomUUID(),
              momentoId,
              tipo: 'URL' as const,
              versaoId,
            },
            {
              canalDeOrigem: 'QR' as const,
              estado: 'ATIVO' as const,
              hmacDoToken: createHash('sha256')
                .update(`${sufixo}:qr:${momentoId}`)
                .digest('hex'),
              id: randomUUID(),
              momentoId,
              tipo: 'QR' as const,
              versaoId,
            },
          ]
        }

        const geracaoA = portasDaGeracao('concorrente-a')
        const geracaoB = portasDaGeracao('concorrente-b')
        const regeneracoes = await Promise.allSettled([
          repositorio.substituirPontosDeAcessoAtomico(
            negocioId,
            momentoId,
            geracaoA,
          ),
          repositorio.substituirPontosDeAcessoAtomico(
            negocioId,
            momentoId,
            geracaoB,
          ),
        ])
        expect(
          regeneracoes.filter(({ status }) => status === 'fulfilled'),
        ).toHaveLength(2)

        const portasDepoisDaConcorrencia =
          await ligacao.baseDeDados.transaction(async (transacao) => {
            await transacao.execute(
              sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
            )
            return transacao
              .select({
                estado: pontosDeAcesso.estado,
                hmac: pontosDeAcesso.hmacDoTokenPublico,
              })
              .from(pontosDeAcesso)
              .where(eq(pontosDeAcesso.experienciaId, momentoId))
          })
        const ativas = portasDepoisDaConcorrencia.filter(
          ({ estado }) => estado === 'ATIVO',
        )
        expect(ativas).toHaveLength(2)
        expect(
          portasDepoisDaConcorrencia.filter(
            ({ estado }) => estado === 'REVOGADO',
          ),
        ).toHaveLength(4)
        const hmacsAtivos = new Set(ativas.map(({ hmac }) => hmac))
        const hmacsDaGeracaoA = new Set(
          geracaoA.map(({ hmacDoToken }) => hmacDoToken),
        )
        const hmacsDaGeracaoB = new Set(
          geracaoB.map(({ hmacDoToken }) => hmacDoToken),
        )
        expect(
          [...hmacsAtivos].every((hmac) => hmacsDaGeracaoA.has(hmac)) ||
            [...hmacsAtivos].every((hmac) => hmacsDaGeracaoB.has(hmac)),
        ).toBe(true)
      } finally {
        await ligacao.encerrar()
      }
    })

    it('resolve tenant por HMAC sob RLS e abre uma única sessão em concorrência', async () => {
      const ligacao = criarBaseDeDados(urlDeIntegracao as string)
      try {
        const { negocioId, utilizadorId } = await prepararNegocioComMembro(ligacao)
        const criacao = new RepositorioDeMomentosDrizzle(ligacao.baseDeDados)
        const editorial = new RepositorioEditorialDeMomentosDrizzle(
          ligacao.baseDeDados,
          { gerarId: () => randomUUID() },
        )
        const publico = new RepositorioDeAcessoPublicoAMomentosDrizzle(
          ligacao.baseDeDados,
        )
        const momentoId = randomUUID()
        const versaoId = randomUUID()
        const pontoId = randomUUID()
        const hmac = createHash('sha256').update(`publico:${momentoId}`).digest('hex')
        await criacao.criarRascunho({
          conteudo: { idioma: 'pt-AO', titulo: 'Acesso público real' },
          experiencia: {
            categoria: 'MOMENTOS', criadoPorUtilizadorId: utilizadorId,
            estado: 'RASCUNHO', fusoHorario: 'Africa/Luanda', id: momentoId,
            idiomaPredefinido: 'pt-AO', negocioId,
            versaoDeRascunhoAtualId: versaoId, versaoPublicadaId: null,
          },
          versao: {
            criadoPorUtilizadorId: utilizadorId, estado: 'RASCUNHO',
            experienciaId: momentoId, id: versaoId, numero: 1,
          },
        })
        await editorial.atualizarRascunho(negocioId, momentoId, {
          capa: { corHexadecimal: '#654321', tipo: 'COR' },
          etapas: [
            { chave: 'inicio', final: false, ordem: 1, texto: 'Privado' },
            { chave: 'final', final: true, ordem: 2, texto: 'Revelação' },
          ],
        })
        await editorial.publicarAtomico({
          abreEm: new Date().toISOString(), estadoDaExperiencia: 'PUBLICADA',
          estadoDaVersao: 'PUBLICADA', momentoId, negocioId,
          pontosDeAcesso: [{
            canalDeOrigem: 'LINK', estado: 'ATIVO', hmacDoToken: hmac,
            id: pontoId, momentoId, tipo: 'URL', versaoId,
          }],
          publicadoEm: new Date().toISOString(),
          somaDeVerificacao: createHash('sha256').update(momentoId).digest('hex'),
          versaoId,
        })

        const porta = await publico.resolver(hmac)
        expect(porta).toMatchObject({ negocioId, pontoDeAcessoId: pontoId })
        const hmacAnonimo = createHash('sha256').update(`anonimo:${momentoId}`).digest('hex')
        const resultados = await Promise.all(
          Array.from({ length: 20 }, () =>
            publico.abrir({
              estado: 'ATIVA', hmacAnonimo, idDoEvento: randomUUID(),
              idDaSessao: randomUUID(), ocorreuEm: new Date().toISOString(), porta: porta!,
            }),
          ),
        )
        expect(new Set(resultados.map(({ sessaoId }) => sessaoId)).size).toBe(1)
        expect(resultados[0]?.etapa?.texto).toBe('Privado')

        const sessoes = await ligacao.baseDeDados.transaction(async (transacao) => {
          await transacao.execute(sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`)
          return transacao.select({ id: sessoesDeInteracao.id })
            .from(sessoesDeInteracao)
            .where(eq(sessoesDeInteracao.pontoDeAcessoId, pontoId))
        })
        expect(sessoes).toHaveLength(1)
        const eventos = await ligacao.baseDeDados.transaction(async (transacao) => {
          await transacao.execute(sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`)
          return transacao.select({ id: eventosDeInteracao.id })
            .from(eventosDeInteracao)
            .where(eq(eventosDeInteracao.experienciaId, momentoId))
        })
        expect(eventos).toHaveLength(1)
        const [consumo] = await ligacao.baseDeDados.transaction(async (transacao) => {
          await transacao.execute(sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`)
          return transacao.select({ quantidade: pontosDeAcesso.quantidadeDeUsos })
            .from(pontosDeAcesso).where(eq(pontosDeAcesso.id, pontoId))
        })
        expect(consumo?.quantidade).toBe(1)

        const hmacEmEspera = createHash('sha256').update(`espera:${momentoId}`).digest('hex')
        await publico.abrir({
          estado: 'EM_ESPERA', hmacAnonimo: hmacEmEspera,
          idDoEvento: randomUUID(), idDaSessao: randomUUID(),
          ocorreuEm: new Date().toISOString(), porta: porta!,
        })
        await publico.abrir({
          estado: 'ATIVA', hmacAnonimo: hmacEmEspera,
          idDoEvento: randomUUID(), idDaSessao: randomUUID(),
          ocorreuEm: new Date().toISOString(), porta: porta!,
        })
        const estadoDepoisDaEspera = await ligacao.baseDeDados.transaction(async (transacao) => {
          await transacao.execute(sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`)
          const [ponto] = await transacao.select({ quantidade: pontosDeAcesso.quantidadeDeUsos })
            .from(pontosDeAcesso).where(eq(pontosDeAcesso.id, pontoId))
          const eventosAbertos = await transacao.select({ id: eventosDeInteracao.id })
            .from(eventosDeInteracao).where(eq(eventosDeInteracao.experienciaId, momentoId))
          return { eventosAbertos, ponto }
        })
        expect(estadoDepoisDaEspera.ponto?.quantidade).toBe(2)
        expect(estadoDepoisDaEspera.eventosAbertos).toHaveLength(2)

        const continuacoes = await Promise.all(
          Array.from({ length: 20 }, () =>
            publico.continuar({
              chaveDaEtapaAtual: 'inicio',
              chaveDeIdempotencia: 'continuacao-concorrente-0001',
              hmacAnonimo,
              idDoEvento: randomUUID(),
              ocorreuEm: new Date().toISOString(),
              porta: porta!,
            }),
          ),
        )
        expect(
          continuacoes.every(
            (resultado) =>
              resultado.estado === 'ATIVA' && resultado.etapa.chave === 'final',
          ),
        ).toBe(true)
        const estadoDaContinuacao = await ligacao.baseDeDados.transaction(
          async (transacao) => {
            await transacao.execute(
              sql`SELECT set_config('app.negocio_id', ${negocioId}, true)`,
            )
            const progresso = await transacao.execute<{ posicao_atual: number }>(
              sql`SELECT posicao_atual FROM progressos_da_sessao WHERE sessao_id = ${resultados[0]!.sessaoId}`,
            )
            const eventos = await transacao
              .select({ tipo: eventosDeInteracao.tipo })
              .from(eventosDeInteracao)
              .where(eq(eventosDeInteracao.experienciaId, momentoId))
            return { eventos, progresso: progresso.rows[0] }
          },
        )
        expect(estadoDaContinuacao.progresso?.posicao_atual).toBe(2)
        expect(
          estadoDaContinuacao.eventos.filter(
            ({ tipo }) => tipo === 'BLOCO_CONTINUADO',
          ),
        ).toHaveLength(1)
        await expect(
          publico.continuar({
            chaveDaEtapaAtual: 'final',
            chaveDeIdempotencia: 'continuacao-concorrente-0001',
            hmacAnonimo,
            idDoEvento: randomUUID(),
            ocorreuEm: new Date().toISOString(),
            porta: porta!,
          }),
        ).rejects.toThrow('CONTINUACAO_IDEMPOTENCIA_DIVERGENTE')
      } finally {
        await ligacao.encerrar()
      }
    })
  },
)
